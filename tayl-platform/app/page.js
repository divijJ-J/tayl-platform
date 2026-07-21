export default function Home() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-2">TAYL Automation Platform</h1>
      <p className="opacity-70 mb-6">
        Phase 1 — quote &amp; proposal calculator is live. Next: invoicing &amp; payments.
      </p>
      <ul className="text-sm space-y-1 opacity-80">
        <li>✅ Database schema deployed (customers, quotes, proposals, invoices, payments, tasks, CRM log)</li>
        <li>✅ App connected to Supabase</li>
        <li>✅ Quote &amp; proposal calculator — create quotes, accept them, auto-drafts an invoice + task</li>
        <li>⏳ Invoicing &amp; Stripe payments — next session</li>
      </ul>
    </div>
  );
}
