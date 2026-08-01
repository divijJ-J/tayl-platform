import { supabaseAdmin } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { token, user_id } = await request.json();
  if (!token || !user_id) {
    return NextResponse.json({ error: 'Missing token or user' }, { status: 400 });
  }

  const { data: invite, error: inviteErr } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: 'This invite link is invalid or already used' }, { status: 400 });
  }

  const { error: memberErr } = await supabaseAdmin
    .from('company_members')
    .insert({ company_id: invite.company_id, user_id, role: invite.role });

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

  await supabaseAdmin.from('invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);

  return NextResponse.json({ success: true });
}
