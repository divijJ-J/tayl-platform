import { supabaseAdmin } from '../../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

// Simulates what the Razorpay webhook does, for testing before a real gateway is connected.
export async function POST(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data: invoice, error: invErr } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (invErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  await supabaseAdmin
    .from('invoices')
    .update({ status: 'paid', amount_paid: invoice.total })
    .eq('id', id);

  await supabaseAdmin.from('payments').insert({
    company_id: companyId,
    invoice_id: id,
    amount: invoice.total,
    method: 'manual',
  });

  await supabaseAdmin.from('communication_log').insert({
    company_id: companyId,
    customer_id: invoice.customer_id,
    type: 'system_event',
    subject: 'Payment received (test)',
    body: `Invoice ${id} marked paid manually — ${invoice.total}`,
  });

  await supabaseAdmin
    .from('tasks')
    .update({ status: 'done' })
    .eq('related_invoice_id', id)
    .eq('status', 'open');

  return NextResponse.json({ success: true });
}
