import { supabaseAdmin } from '../lib/supabase';
import { getCurrentCompanyId } from '../lib/supabase-server';
import Landing from './components/Landing';

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
        <a href="/tasks" className="border border-white/10 rounded px-4 py-3 hover:border-white/30">
          <div className="opacity-60">Open tasks</div>
          <div className="text-2xl font-semibold">{openTasks || 0}</div>
        </a>
        <a href="/quotes" className="border border-white/10 rounded px-4 py-3 hover:border-white/30">
          <div className="opacity-60">Draft quotes</div>
          <div className="text-2xl font-semibold">{draftQuotes || 0}</div>
        </a>
        <a href="/invoices" className="border border-white/10 rounded px-4 py-3 hover:border-white/30">
          <div className="opacity-60">Outstanding</div>
          <div className="text-2xl font-semibold">₹{outstanding.toFixed(0)}</div>
        </a>
      </div>

      <div className="flex gap-3 text-sm">
        <a href="/quotes/new" className="bg-white text-black rounded px-4 py-2 font-medium">
          + New Quote
        </a>
        <a href="/estimates" className="border border-white/20 rounded px-4 py-2">
          AI Estimate
        </a>
      </div>
    </div>
  );
}
