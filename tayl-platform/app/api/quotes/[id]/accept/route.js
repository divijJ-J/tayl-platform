import { supabase } from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = params;

  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (qErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  // Mark quote accepted
  await supabase.from('quotes').update({ status: 'accepted' }).eq('id', id);

  // Create a proposal record marked accepted (acting as the acceptance record)
  const forwarded = request.headers.get('x-forwarded-for') || 'unknown';
  const { data: proposal, error: pErr } = await supabase
    .from('proposals')
    .insert({
      quote_id: quote.id,
      customer_id: quote.customer_id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_ip: forwarded,
    })
    .select()
    .single();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Auto-create a draft invoice from the accepted quote
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      customer_id: quote.customer_id,
      proposal_id: proposal.id,
      status: 'draft',
      subtotal: quote.subtotal,
      total: quote.total,
    })
    .select()
    .single();

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  // Auto-create a follow-up task
  await supabase.from('tasks').insert({
    title: `Send invoice for accepted quote`,
    trigger_type: 'proposal_accepted',
    related_customer_id: quote.customer_id,
    related_invoice_id: invoice.id,
    related_proposal_id: proposal.id,
  });

  await supabase.from('communication_log').insert({
    customer_id: quote.customer_id,
    type: 'system_event',
    subject: 'Proposal accepted',
    body: `Quote ${quote.id} accepted, invoice ${invoice.id} drafted automatically`,
  });

  return NextResponse.json({ proposal, invoice });
}
