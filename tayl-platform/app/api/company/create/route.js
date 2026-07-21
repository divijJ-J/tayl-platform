import { supabaseAdmin } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { user_id, company_name } = await request.json();

  if (!user_id || !company_name) {
    return NextResponse.json({ error: 'Missing user or company name' }, { status: 400 });
  }

  const { data: company, error: companyErr } = await supabaseAdmin
    .from('companies')
    .insert({ name: company_name })
    .select()
    .single();

  if (companyErr) return NextResponse.json({ error: companyErr.message }, { status: 500 });

  const { error: memberErr } = await supabaseAdmin
    .from('company_members')
    .insert({ company_id: company.id, user_id, role: 'owner' });

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

  return NextResponse.json({ company });
}
