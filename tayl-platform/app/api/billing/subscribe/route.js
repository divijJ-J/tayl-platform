import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { NextResponse } from 'next/server';

// Simulates a successful subscription payment. Real billing (via Razorpay
// Subscriptions) plugs in here later — same pattern as invoice payments.
export async function POST(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { plan } = await request.json();
  if (!['starter', 'pro'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('companies')
    .update({ plan, subscription_status: 'active' })
    .eq('id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
