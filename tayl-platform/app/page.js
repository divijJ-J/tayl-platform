import { supabaseAdmin } from '../lib/supabase';
import { getCurrentCompanyId } from '../lib/supabase-server';
import Landing from './components/Landing';
import TiltCard from './components/TiltCard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function Home() {
  const { user, companyId } = await getCurrentCompanyId();

  if (!user) {
    return <Landing />;
  }

  const [{ count: openTasks }, { count: draftQuotes }, { data: invoices }] = await Promise.all([
    supabaseAdmin.from('tasks').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'open'),
    supabaseAdmin.from('quotes').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'draft'),
    supabaseAdmin.from('invoices').select('status, total').eq('company_id', companyId),
  ]);

  const outstanding = (invoices || [])
    .filter((i) => i.status === 'sent')
    .reduce((s, i) => s + i.total, 0);

  const stats = [
    { href: '/tasks', label: 'Open tasks', value: openTasks || 0 },
    { href: '/quotes', label: 'Draft quotes', value: draftQuotes || 0 },
    { href: '/invoices', label: 'Outstanding', value: `₹${outstanding.toFixed(0)}` },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Here&apos;s where things stand today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <TiltCard key={s.href}>
            <a
              href={s.href}
              className="surface-card rounded-2xl px-5 py-4 block h-full"
            >
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className="grad-text font-display text-3xl font-semibold">{s.value}</div>
            </a>
          </TiltCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <a href="/quotes/new" className="btn-primary rounded-full px-5 py-2.5 font-medium">
          + New Quote
        </a>
        <a
          href="/estimates"
          className="rounded-full px-5 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors font-medium"
        >
          ✨ AI Estimate
        </a>
      </div>
    </div>
  );
}
