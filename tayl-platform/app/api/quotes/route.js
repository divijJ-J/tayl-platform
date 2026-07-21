import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { customer_name, customer_email, tax_rate = 0, discount = 0, notes, line_items } = body;

  if (!customer_name || !line_items || line_items.length === 0) {
    return NextResponse.json({ error: 'Customer name and at least one line item are required' }, { status: 400 });
  }

  // 1. Find or create the customer
  let customer;
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('name', customer_name)
    .maybeSingle();

  if (existing) {
    customer = existing;
  } else {
    const { data: created, error: custErr } = await supabase
      .from('customers')
      .insert({ name: customer_name, email: customer_email })
      .select()
      .single();
    if (custErr) return NextResponse.json({ error: custErr.message }, { status: 500 });
    customer = created;
  }

  // 2. Calculate totals
  const subtotal = line_items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);
  const afterDiscount = subtotal - discount;
  const total = afterDiscount + afterDiscount * (tax_rate / 100);

  // 3. Create the quote
  const { data: quote, error: quoteErr } = await supabase
    .from('quotes')
    .insert({
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

  // 4. Insert line items
  const itemsToInsert = line_items.map((li) => ({
    quote_id: quote.id,
    description: li.description,
    quantity: li.quantity,
    unit_price: li.unit_price,
    line_total: li.quantity * li.unit_price,
  }));

  const { error: itemsErr } = await supabase.from('quote_line_items').insert(itemsToInsert);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  // 5. Log it in the CRM activity log
  await supabase.from('communication_log').insert({
    customer_id: customer.id,
    type: 'system_event',
    subject: 'Quote created',
    body: `Quote ${quote.id} created for ${total.toFixed(2)}`,
  });

  return NextResponse.json({ quote, customer });
}
