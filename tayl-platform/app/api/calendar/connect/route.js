import { getCurrentCompanyId } from '../../../../lib/supabase-server';
import { getGoogleAuthUrl } from '../../../../lib/google-calendar';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { companyId } = await getCurrentCompanyId();
  if (!companyId) return NextResponse.redirect(new URL('/login', request.url));

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google Calendar is not configured yet — add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in Vercel env vars.' },
      { status: 500 }
    );
  }

  const url = getGoogleAuthUrl(companyId);
  return NextResponse.redirect(url);
}
