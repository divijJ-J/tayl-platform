import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentCompanyId } from '../../../lib/supabase-server';
import { redirect } from 'next/navigation';
import DisconnectButton from './DisconnectButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function CalendarSettingsPage({ searchParams }) {
  const { user, companyId, role } = await getCurrentCompanyId();
  if (!user) redirect('/login');
  if (role !== 'owner') redirect('/');

  const { data: connection } = await supabaseAdmin
    .from('calendar_connections')
    .select('google_email, created_at')
    .eq('company_id', companyId)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Google Calendar</h1>
      <p className="text-sm opacity-60 mb-6">
        Connect Google Calendar so tasks with a due date automatically get a calendar event.
      </p>

      {searchParams?.connected && (
        <p className="text-sm text-green-400 mb-4">Connected successfully.</p>
      )}
      {searchParams?.error && (
        <p className="text-sm text-red-400 mb-4">Couldn&apos;t connect: {searchParams.error}</p>
      )}

      {connection ? (
        <div className="border border-white/10 rounded px-4 py-3">
          <p className="text-sm">
            Connected as <span className="font-medium">{connection.google_email}</span>
          </p>
          <div className="mt-3">
            <DisconnectButton />
          </div>
        </div>
      ) : (
        <a
          href="/api/calendar/connect"
          className="inline-block btn-primary rounded px-4 py-2 text-sm font-medium"
        >
          Connect Google Calendar
        </a>
      )}
    </div>
  );
}
