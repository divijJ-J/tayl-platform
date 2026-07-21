import { supabaseAdmin } from '../../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../../lib/supabase-server';
import { createPaymentLink } from '../../../../../lib/razorpay';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data: invoice, error: invErr } = await supabaseAdmin
    .from('invoices')
    .select('*, customers(name, email)')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (invErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const { data: gateway } = await supabaseAdmin
    .from('payment_gateway_keys')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (!gateway?.key_id || !gateway?.key_secret) {
    return NextResponse.json(
      { error: 'Connect your Razorpay account first — go to Settings > Payment Gateway.' },
      { status: 400 }
    );
  }

  try {
    const link = await createPaymentLink({
      keyId: gateway.key_id,
      keySecret: gateway.key_secret,
      amount: invoice.total,
      description: `Invoice ${invoice.id.slice(0, 8)}`,
      customerName: invoice.customers?.name,
      customerEmail: invoice.customers?.email,
      notes: { invoice_id: invoice.id, company_id: companyId },
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    await supabaseAdmin
      .from('invoices')
      .update({
        status: 'sent',
        stripe_payment_link: link.short_url,
        due_date: dueDate.toISOString().split('T')[0],
      })
      .eq('id', id);

    await supabaseAdmin.from('communication_log').insert({
      company_id: companyId,
      customer_id: invoice.customer_id,
      type: 'system_event',
      subject: 'Invoice sent',
      body: `Invoice ${invoice.id} sent via Razorpay, due ${dueDate.toISOString().split('T')[0]}`,
    });

    return NextResponse.json({ payment_link: link.short_url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
