import { supabaseAdmin } from '../../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data: quote, error: qErr } = await supabaseAdmin
    .from('quotes')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (qErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  await supabaseAdmin.from('quotes').update({ status: 'accepted' }).eq('id', id);

  const forwarded = request.headers.get('x-forwarded-for') || 'unknown';
  const { data: proposal, error: pErr } = await supabaseAdmin
    .from('proposals')
    .insert({
      company_id: companyId,
      quote_id: quote.id,
      customer_id: quote.customer_id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_ip: forwarded,
    })
    .select()
    .single();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const { data: invoice, error: invErr } = await supabaseAdmin
    .from('invoices')
    .insert({
      company_id: companyId,
      customer_id: quote.customer_id,
      proposal_id: proposal.id,
      status: 'draft',
      subtotal: quote.subtotal,
      total: quote.total,
    })
    .select()
    .single();

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  await supabaseAdmin.from('tasks').insert({
    company_id: companyId,
    title: `Send invoice for accepted quote`,
    trigger_type: 'proposal_accepted',
    related_customer_id: quote.customer_id,
    related_invoice_id: invoice.id,
    related_proposal_id: proposal.id,
  });

  await supabaseAdmin.from('communication_log').insert({
    company_id: companyId,
    customer_id: quote.customer_id,
    type: 'system_event',
    subject: 'Proposal accepted',
    body: `Quote ${quote.id} accepted, invoice ${invoice.id} drafted automatically`,
  });

  return NextResponse.json({ proposal, invoice });
}
