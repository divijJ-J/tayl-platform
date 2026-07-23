import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentCompanyId } from '../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ services: data });
}

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { name, description, unit_price, unit, category } = await request.json();
  if (!name || unit_price === undefined) {
    return NextResponse.json({ error: 'Name and unit price are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('services').insert({
    company_id: companyId,
    name,
    description,
    unit_price,
    unit: unit || 'each',
    category,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabaseAdmin.from('services').delete().eq('id', id).eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
