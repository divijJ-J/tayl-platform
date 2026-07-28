import { supabaseAdmin } from '../../lib/supabase';
import { getCurrentCompanyId } from '../../lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function CustomersPage() {
  const { user, companyId } = await getCurrentCompanyId();
  if (!user) redirect('/login');

  const { data: customers, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Customers</h1>

      {error && (
        <p className="text-red-400 text-sm mb-4">Error: {error.message}</p>
      )}

      {!error && (!customers || customers.length === 0) && (
        <p className="opacity-60 text-sm">
          No customers yet — they get created automatically when you make a quote.
        </p>
      )}

      {customers && customers.length > 0 && (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id}>
              <a
                href={`/customers/${c.id}`}
                className="block border border-white/10 rounded px-4 py-2 hover:bg-white/5"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-sm opacity-60">{c.email}</div>
                {c.ai_summary && (
                  <div className="text-xs opacity-40 mt-1 truncate">{c.ai_summary}</div>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
