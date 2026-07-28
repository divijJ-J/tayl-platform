import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { exchangeCodeForTokens, getGoogleEmail } from '../../../../lib/google-calendar';
import { supabaseAdmin } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.redirect(new URL('/login', request.url));

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings/calendar?error=denied', request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const email = await getGoogleEmail(tokens.access_token);
    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabaseAdmin.from('calendar_connections').upsert(
      {
        company_id: companyId,
        google_email: email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: expiry,
      },
      { onConflict: 'company_id' }
    );

    return NextResponse.redirect(new URL('/settings/calendar?connected=1', request.url));
  } catch (err) {
    return NextResponse.redirect(
      new URL(`/settings/calendar?error=${encodeURIComponent(err.message)}`, request.url)
    );
  }
}
