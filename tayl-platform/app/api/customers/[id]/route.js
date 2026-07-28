import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data: customer, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: log } = await supabaseAdmin
    .from('communication_log')
    .select('*')
    .eq('customer_id', id)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ customer, log: log || [] });
}
