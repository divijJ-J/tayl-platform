import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentCompanyId } from '../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await request.json();
  const { customer_name, customer_email, tax_rate = 0, discount = 0, notes, line_items } = body;

  if (!customer_name || !line_items || line_items.length === 0) {
    return NextResponse.json({ error: 'Customer name and at least one line item are required' }, { status: 400 });
  }

  let customer;
  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('name', customer_name)
    .eq('company_id', companyId)
    .maybeSingle();

  if (existing) {
    customer = existing;
  } else {
    const { data: created, error: custErr } = await supabaseAdmin
      .from('customers')
      .insert({ name: customer_name, email: customer_email, company_id: companyId })
      .select()
      .single();
    if (custErr) return NextResponse.json({ error: custErr.message }, { status: 500 });
    customer = created;
  }

  const subtotal = line_items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);
  const afterDiscount = subtotal - discount;
  const total = afterDiscount + afterDiscount * (tax_rate / 100);

  const { data: quote, error: quoteErr } = await supabaseAdmin
    .from('quotes')
    .insert({
      company_id: companyId,
      customer_id: customer.id,
      status: 'draft',
      subtotal,
      tax_rate,
      discount,
      total,
      notes,
    })
    .select()
    .single();

  if (quoteErr) return NextResponse.json({ error: quoteErr.message }, { status: 500 });

  const itemsToInsert = line_items.map((li) => ({
    quote_id: quote.id,
    description: li.description,
    quantity: li.quantity,
    unit_price: li.unit_price,
    line_total: li.quantity * li.unit_price,
  }));

  const { error: itemsErr } = await supabaseAdmin.from('quote_line_items').insert(itemsToInsert);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  await supabaseAdmin.from('communication_log').insert({
    company_id: companyId,
    customer_id: customer.id,
    type: 'system_event',
    subject: 'Quote created',
    body: `Quote ${quote.id} created for ${total.toFixed(2)}`,
  });

  return NextResponse.json({ quote, customer });
}
