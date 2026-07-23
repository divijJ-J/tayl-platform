import { getCurrentCompanyId } from '../lib/supabase-server';

export default async function Home() {
  const { user } = await getCurrentCompanyId();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-2">TAYL Automation Platform</h1>
      <p className="opacity-70 mb-6">
        Multi-tenant — each business gets their own login, data, and connects their own
        Razorpay account for payments.
      </p>
      <ul className="text-sm space-y-1 opacity-80">
        <li>✅ Multi-tenant database — every business's data is isolated (RLS enforced)</li>
        <li>✅ Sign up / log in — each business gets its own account</li>
        <li>✅ Quote &amp; proposal calculator — create, accept, auto-drafts invoice + task</li>
        <li>✅ Invoicing — each business connects their own Razorpay account in Settings (test-mode "Mark as Paid" available until then)</li>
        <li>✅ Task automation board — kanban view, auto-created tasks, comments</li>
        <li>✅ AI estimate generator — describe a job, get a priced estimate from your own catalog, approve to create a quote</li>
        <li>⏳ Billing for the platform itself + landing page — next session</li>
      </ul>
      {!user && (
        <div className="mt-6 flex gap-3">
          <a href="/signup" className="bg-white text-black rounded px-4 py-2 text-sm font-medium">
            Sign up
          </a>
          <a href="/login" className="border border-white/20 rounded px-4 py-2 text-sm">
            Log in
          </a>
        </div>
      )}
    </div>
  );
}
