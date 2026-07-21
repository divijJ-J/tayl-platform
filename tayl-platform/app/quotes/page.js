import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import AcceptButton from './AcceptButton';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*, customers(name, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quotes</h1>
        <Link href="/quotes/new" className="bg-white text-black rounded px-3 py-1.5 text-sm font-medium">
          + New Quote
        </Link>
      </div>

      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {!error && (!quotes || quotes.length === 0) && (
        <p className="opacity-60 text-sm">No quotes yet — create one to get started.</p>
      )}

      <div className="space-y-2">
        {quotes?.map((q) => (
          <div key={q.id} className="border border-white/10 rounded px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{q.customers?.name || 'Unknown customer'}</div>
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
