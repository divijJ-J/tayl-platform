import { supabaseAdmin } from './supabase';

// Requires these Vercel env vars (free — create at console.cloud.google.com):
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
// (GOOGLE_REDIRECT_URI = https://your-app.vercel.app/api/calendar/callback,
//  also add it under Authorized redirect URIs in the Google Cloud OAuth client)

export function getGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events email',
    access_type: 'offline',
    prompt: 'consent',
    state: state || '',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Google token exchange failed');
  return data; // { access_token, refresh_token, expires_in, id_token, ... }
}

export async function getGoogleEmail(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.email || null;
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Failed to refresh Google token');
  return data; // { access_token, expires_in, ... }
}

// Returns a valid access token for the company's calendar connection, refreshing if expired.
// Returns null if the company has no calendar connected.
export async function getValidAccessToken(companyId) {
  const { data: conn } = await supabaseAdmin
    .from('calendar_connections')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (!conn) return null;

  const expired = !conn.token_expiry || new Date(conn.token_expiry) <= new Date();
  if (!expired) return conn.access_token;

  const refreshed = await refreshAccessToken(conn.refresh_token);
  const expiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await supabaseAdmin
    .from('calendar_connections')
    .update({ access_token: refreshed.access_token, token_expiry: expiry })
    .eq('company_id', companyId);

  return refreshed.access_token;
}

// Creates a calendar event and returns its Google event ID.
export async function createCalendarEvent(accessToken, { summary, description, date }) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary,
      description,
      start: { date }, // all-day event on the task's due_date
      end: { date },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to create calendar event');
  return data.id;
}

export async function updateCalendarEvent(accessToken, eventId, { summary, description, date }) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        start: { date },
        end: { date },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to update calendar event');
  return data.id;
}
