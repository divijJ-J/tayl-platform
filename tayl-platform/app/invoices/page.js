import { supabaseAdmin } from '../../lib/supabase';
import { getCurrentCompanyId } from '../../lib/supabase-server';
import { redirect } from 'next/navigation';
import SendButton from './SendButton';
import CopyLink from './CopyLink';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function InvoicesPage() {
  const { user, companyId } = await getCurrentCompanyId();
  if (!user) redirect('/login');

  const { data: invoices, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('id, name')
    .eq('company_id', companyId);
  const customerMap = Object.fromEntries((customers || []).map((c) => [c.id, c]));

  const paid = invoices?.filter((i) => i.status === 'paid') || [];
  const unpaid = invoices?.filter((i) => i.status === 'sent') || [];
  const draft = invoices?.filter((i) => i.status === 'draft') || [];
  const totalRevenue = paid.reduce((s, i) => s + (i.amount_paid || i.total), 0);
  const outstanding = unpaid.reduce((s, i) => s + i.total, 0);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Invoices</h1>

      <div className="grid grid-cols-4 gap-3 mb-6 text-sm">
        <div className="border border-white/10 rounded px-3 py-2">
          <div className="opacity-60">Paid</div>
          <div className="text-lg font-semibold">₹{totalRevenue.toFixed(2)}</div>
        </div>
        <div className="border border-white/10 rounded px-3 py-2">
          <div className="opacity-60">Outstanding</div>
          <div className="text-lg font-semibold">₹{outstanding.toFixed(2)}</div>
        </div>
        <div className="border border-white/10 rounded px-3 py-2">
          <div className="opacity-60">Draft</div>
          <div className="text-lg font-semibold">{draft.length}</div>
        </div>
        <div className="border border-white/10 rounded px-3 py-2">
          <div className="opacity-60">Sent</div>
          <div className="text-lg font-semibold">{unpaid.length}</div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">Error: {error.message}</p>}

      {!error && (!invoices || invoices.length === 0) && (
        <p className="opacity-60 text-sm">
          No invoices yet — these get created automatically when a quote is accepted.
        </p>
      )}

      <div className="space-y-2">
        {invoices?.map((inv) => (
          <div key={inv.id} className="border border-white/10 rounded px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{customerMap[inv.customer_id]?.name || 'Unknown customer'}</div>
                <div className="text-sm opacity-60">
                  ₹{inv.total} · Status: {inv.status}
                  {inv.due_date ? ` · Due ${inv.due_date}` : ''}
                </div>
              </div>
              {inv.status === 'draft' && <SendButton invoiceId={inv.id} />}
              {inv.status === 'sent' && inv.stripe_payment_link && (
                <CopyLink link={inv.stripe_payment_link} />
              )}
              {inv.status === 'paid' && (
                <span className="text-sm text-green-400 border border-green-600/40 rounded px-3 py-1.5">
                  Paid
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
