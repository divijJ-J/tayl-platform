import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentCompanyId } from '../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { key_id, key_secret, webhook_secret } = await request.json();
  if (!key_id || !key_secret) {
    return NextResponse.json({ error: 'Key ID and Key Secret are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('payment_gateway_keys').upsert(
    {
      company_id: companyId,
      provider: 'razorpay',
      key_id,
      key_secret,
      webhook_secret: webhook_secret || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'company_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('payment_gateway_keys')
    .select('key_id, provider, updated_at')
    .eq('company_id', companyId)
    .maybeSingle();

  // Never return the secret to the client — only whether it's connected
  return NextResponse.json({ connected: !!data, key_id: data?.key_id || null });
}
