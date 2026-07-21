import { supabaseAdmin } from '../../../../lib/supabase';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const payload = JSON.parse(rawBody);

  // Payment Links carry your notes (invoice_id, company_id) straight through
  const entity = payload.payload?.payment_link?.entity || payload.payload?.payment?.entity;
  const notes = entity?.notes || {};
  const invoiceId = notes.invoice_id;
  const companyId = notes.company_id;

  if (!invoiceId || !companyId) {
    return NextResponse.json({ error: 'Missing invoice/company reference in webhook payload' }, { status: 400 });
  }

  // Verify using THIS company's own webhook secret — not a shared platform secret
  const { data: gateway } = await supabaseAdmin
    .from('payment_gateway_keys')
    .select('webhook_secret')
    .eq('company_id', companyId)
    .maybeSingle();

  if (gateway?.webhook_secret) {
    const expected = crypto
      .createHmac('sha256', gateway.webhook_secret)
      .update(rawBody)
      .digest('hex');
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }
  }

  if (payload.event === 'payment_link.paid' || payload.event === 'payment.captured') {
    const amountPaid = (entity.amount_paid ?? entity.amount ?? 0) / 100;

    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoice) {
      await supabaseAdmin
        .from('invoices')
        .update({ status: 'paid', amount_paid: amountPaid })
        .eq('id', invoiceId);

      await supabaseAdmin.from('payments').insert({
        company_id: companyId,
        invoice_id: invoiceId,
        amount: amountPaid,
        method: 'razorpay',
        stripe_payment_intent_id: entity.id,
      });

      await supabaseAdmin.from('communication_log').insert({
        company_id: companyId,
        customer_id: invoice.customer_id,
        type: 'system_event',
        subject: 'Payment received',
        body: `Invoice ${invoiceId} paid — ${amountPaid}`,
      });

      await supabaseAdmin
        .from('tasks')
        .update({ status: 'done' })
        .eq('related_invoice_id', invoiceId)
        .eq('status', 'open');
    }
  }

  return NextResponse.json({ received: true });
}
