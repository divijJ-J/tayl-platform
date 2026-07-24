const FEATURES = [
  {
    title: 'Quotes that become invoices',
    body: 'Build a quote, send it, and the moment it\'s accepted the invoice and the follow-up task draft themselves.',
  },
  {
    title: 'Get paid without chasing',
    body: 'Connect your own payment account. A link goes out, the payment comes in, the invoice marks itself paid.',
  },
  {
    title: 'A job board that fills itself',
    body: 'Every accepted quote, every paid invoice — the right task lands in the right column automatically.',
  },
  {
    title: 'Estimates priced from your own rates',
    body: 'Describe the job in plain language. It prices the work from your catalog — never invents a number.',
  },
];

const STEPS = ['Quote', 'Accepted', 'Invoiced', 'Paid', 'Task closed'];

export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <p className="text-xs tracking-[0.2em] uppercase opacity-50 mb-4">For service businesses</p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-5 max-w-2xl">
          The paperwork runs itself. You run the business.
        </h1>
        <p className="text-lg opacity-70 max-w-xl mb-8">
          TAYL turns one accepted quote into an invoice, a payment link, and a tracked task —
          without you touching a spreadsheet.
        </p>
        <div className="flex gap-3">
          <a href="/signup" className="bg-white text-black rounded px-5 py-2.5 text-sm font-medium">
            Start free — 14 days
          </a>
          <a href="/login" className="border border-white/20 rounded px-5 py-2.5 text-sm">
            Log in
          </a>
        </div>
      </section>

      {/* Signature: the ledger chain */}
      <section className="border-y border-white/10 py-8 mb-16 overflow-x-auto">
        <div className="flex items-center gap-3 text-sm font-mono whitespace-nowrap">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="border border-white/15 rounded px-3 py-1.5 opacity-80">{step}</span>
              {i < STEPS.length - 1 && <span className="opacity-30">→</span>}
            </div>
          ))}
          <span className="opacity-40 ml-2">— all one action</span>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 gap-x-8 gap-y-10 mb-20">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <h3 className="font-medium mb-1.5">{f.title}</h3>
            <p className="text-sm opacity-60 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-6">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-white/10 rounded px-5 py-5">
            <div className="font-medium mb-1">Starter</div>
            <div className="text-3xl font-semibold mb-4">
              ₹999<span className="text-sm opacity-60 font-normal">/mo</span>
            </div>
            <ul className="text-sm opacity-70 space-y-1.5">
              <li>Up to 50 customers</li>
              <li>Quotes &amp; invoicing</li>
              <li>Task board</li>
            </ul>
          </div>
          <div className="border border-white/20 rounded px-5 py-5">
            <div className="font-medium mb-1">Pro</div>
            <div className="text-3xl font-semibold mb-4">
              ₹2,499<span className="text-sm opacity-60 font-normal">/mo</span>
            </div>
            <ul className="text-sm opacity-70 space-y-1.5">
              <li>Unlimited customers</li>
              <li>AI Estimate Generator</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>
        <p className="text-xs opacity-40 mt-4">Every plan starts with a 14-day free trial. No card required to start.</p>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-white/10 py-12 text-center mb-8">
        <h2 className="text-2xl font-semibold mb-3">Set it up once. Let it run.</h2>
        <a href="/signup" className="inline-block bg-white text-black rounded px-6 py-3 text-sm font-medium">
          Start your free trial
        </a>
      </section>
    </div>
  );
}
