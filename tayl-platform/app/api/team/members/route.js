import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { companyId, role } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (role !== 'owner') return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  const { data: members } = await supabaseAdmin
    .from('company_members')
    .select('user_id, role, created_at')
    .eq('company_id', companyId);

  // Look up emails for member user_ids via auth admin API
  const membersWithEmail = await Promise.all(
    (members || []).map(async (m) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(m.user_id);
      return { ...m, email: data?.user?.email || 'Unknown' };
    })
  );

  const { data: invites } = await supabaseAdmin
    .from('invites')
    .select('id, email, role, token, accepted_at, created_at')
    .eq('company_id', companyId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  return NextResponse.json({ members: membersWithEmail, invites: invites || [] });
}
