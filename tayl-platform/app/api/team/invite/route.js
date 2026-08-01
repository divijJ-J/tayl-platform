import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { companyId, role } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (role !== 'owner') return NextResponse.json({ error: 'Only the owner can invite team members' }, { status: 403 });

  const { email, invite_role } = await request.json();
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .insert({ company_id: companyId, email, role: invite_role === 'owner' ? 'owner' : 'sales' })
    .select('id, token')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ token: invite.token });
}
