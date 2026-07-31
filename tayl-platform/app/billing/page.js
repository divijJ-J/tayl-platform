import { supabaseAdmin } from '../../lib/supabase';
import { getCurrentCompanyId } from '../../lib/supabase-server';
import { redirect } from 'next/navigation';
import SubscribeButton from './SubscribeButton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const PLANS = [
  { key: 'starter', name: 'Starter', price: 999, features: ['Up to 50 customers', 'Quotes & invoicing', 'Task board'] },
  { key: 'pro', name: 'Pro', price: 2499, features: ['Unlimited customers', 'AI Estimate Generator', 'Priority support'] },
];

export default async function BillingPage() {
  const { user, companyId } = await getCurrentCompanyId();
  if (!user) redirect('/login');

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  const trialEnds = company?.trial_ends_at ? new Date(company.trial_ends_at) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const isTrialing = company?.subscription_status === 'trialing';
  const isActive = company?.subscription_status === 'active';

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Billing</h1>

      <div className="border border-white/10 rounded px-4 py-3 mb-6 text-sm">
        {isActive && (
          <p>
            Current plan: <span className="font-medium">{company.plan}</span> — active
          </p>
        )}
        {isTrialing && (
          <p>
            Free trial — <span className="font-medium">{daysLeft} day(s) left</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PLANS.map((p) => (
          <div key={p.key} className="border border-white/10 rounded px-4 py-4">
            <div className="font-medium mb-1">{p.name}</div>
            <div className="text-2xl font-semibold mb-3">
              ₹{p.price}
              <span className="text-sm opacity-60 font-normal">/mo</span>
            </div>
            <ul className="text-sm opacity-70 space-y-1 mb-4">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <SubscribeButton plan={p.key} current={company?.plan === p.key && isActive} />
          </div>
        ))}
      </div>

      <p className="text-xs opacity-40 mt-6">
        Test mode — no real payment is charged yet. Live billing connects here the same way Razorpay connects for invoices.
      </p>
    </div>
  );
}
