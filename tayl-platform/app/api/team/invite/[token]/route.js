import { supabaseAdmin } from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { token } = params;

  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .select('email, role, company_id, companies(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();

  if (error || !invite) {
    return NextResponse.json({ error: 'Invalid or already-used invite' }, { status: 404 });
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    company_name: invite.companies?.name || 'the team',
  });
}
