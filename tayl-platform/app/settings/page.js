import { getCurrentCompanyId } from '../../lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const SECTIONS = [
  { href: '/settings/services', title: 'Pricing Catalog', body: 'The services and rates quotes and AI estimates draw from.' },
  { href: '/settings/knowledge', title: 'Knowledge Base', body: 'Business context the AI uses to answer questions accurately.' },
  { href: '/settings/chat', title: 'Chat Widget', body: 'Your AI receptionist — greeting, persona, and embed code.' },
  { href: '/settings/whatsapp', title: 'WhatsApp', body: 'Connect a number so customers can message you directly.' },
  { href: '/settings/calendar', title: 'Calendar', body: 'Sync task due dates to Google Calendar automatically.' },
  { href: '/settings/team', title: 'Team', body: 'Invite teammates with limited, role-based access.' },
  { href: '/settings/payments', title: 'Payment Settings', body: 'Connect your Razorpay account to accept payments.' },
  { href: '/billing', title: 'Billing', body: 'Your TAYL plan and subscription.' },
];

export default async function SettingsHubPage() {
  const { user, role } = await getCurrentCompanyId();
  if (!user) redirect('/login');
  if (role !== 'owner') redirect('/');

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-white/50 mb-6">Configure how your business runs on TAYL.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="surface-card rounded-2xl px-5 py-4 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="font-display font-semibold text-[15px] mb-1">{s.title}</h2>
            <p className="text-sm text-white/50">{s.body}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
