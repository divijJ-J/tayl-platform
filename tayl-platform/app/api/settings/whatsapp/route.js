import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('public_slug')
    .eq('id', companyId)
    .single();

  const { data: connection } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('phone_number_id, verify_token')
    .eq('company_id', companyId)
    .maybeSingle();

  return NextResponse.json({
    public_slug: company?.public_slug || null,
    phone_number_id: connection?.phone_number_id || '',
    verify_token: connection?.verify_token || '',
    connected: !!connection,
  });
}

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { phone_number_id, access_token, verify_token } = await request.json();

  if (!phone_number_id || !verify_token) {
    return NextResponse.json({ error: 'Phone Number ID and Verify Token are required' }, { status: 400 });
  }

  let tokenToSave = access_token;
  if (!tokenToSave) {
    const { data: existing } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('access_token')
      .eq('company_id', companyId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Access Token is required' }, { status: 400 });
    }
    tokenToSave = existing.access_token;
  }

  const { error } = await supabaseAdmin.from('whatsapp_connections').upsert(
    { company_id: companyId, phone_number_id, access_token: tokenToSave, verify_token },
    { onConflict: 'company_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
