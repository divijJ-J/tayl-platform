import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Customers</h1>

      {error && (
        <p className="text-red-400 text-sm mb-4">
          Connection error: {error.message}. Check your Supabase env vars in Vercel.
        </p>
      )}

      {!error && (!customers || customers.length === 0) && (
        <p className="opacity-60 text-sm">
          No customers yet — this page is reading live from your Supabase
          `customers` table. Add a row there and refresh to confirm the
          connection is working.
        </p>
      )}

      {customers && customers.length > 0 && (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id} className="border border-white/10 rounded px-4 py-2">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm opacity-60">{c.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
