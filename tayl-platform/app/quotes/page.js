import { supabaseAdmin } from '../../lib/supabase';
import { getCurrentCompanyId } from '../../lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AcceptButton from './AcceptButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function QuotesPage() {
  const { user, companyId } = await getCurrentCompanyId();
  if (!user) redirect('/login');

  const { data: quotes, error: quotesErr } = await supabaseAdmin
    .from('quotes')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('id, name')
    .eq('company_id', companyId);
  const customerMap = Object.fromEntries((customers || []).map((c) => [c.id, c]));

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quotes</h1>
        <Link href="/quotes/new" className="bg-white text-black rounded px-3 py-1.5 text-sm font-medium">
          + New Quote
        </Link>
      </div>

      {quotesErr && <p className="text-red-400 text-sm mb-4">Error: {quotesErr.message}</p>}

      {!quotesErr && (!quotes || quotes.length === 0) && (
        <p className="opacity-60 text-sm">No quotes yet — create one to get started.</p>
      )}

      <div className="space-y-2">
        {quotes?.map((q) => (
          <div key={q.id} className="border border-white/10 rounded px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{customerMap[q.customer_id]?.name || 'Unknown customer'}</div>
              <div className="text-sm opacity-60">
                Total: {q.total} · Status: {q.status}
              </div>
            </div>
            {q.status === 'draft' && <AcceptButton quoteId={q.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
