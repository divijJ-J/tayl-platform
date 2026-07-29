import TiltCard from './TiltCard';

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
      <section className="pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase opacity-50 mb-4">For service businesses</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-5">
            The paperwork runs itself. You run the business.
          </h1>
          <p className="text-lg opacity-70 mb-8">
            One accepted quote becomes an invoice, a payment link, and a tracked task — automatically.
            An AI receptionist answers your customers, remembers every conversation, and prices estimates
            from your own rates.
          </p>
          <div className="flex gap-3 mb-6">
            <a href="/signup" className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium">
              Start free — 14 days
            </a>
            <a href="/login" className="rounded-full px-5 py-2.5 text-sm border border-slate-300 hover:border-slate-400 transition-colors">
              Log in
            </a>
          </div>
          <p className="text-xs opacity-40">Quotes · Invoices · Tasks · AI Estimates · Customer Memory · AI Chat Widget</p>
        </div>

        {/* Signature: live demo panel, mirrors what a customer actually sees on your AI Chat Widget */}
        <TiltCard>
          <div className="surface-card rounded-2xl p-5 h-full">
            <p className="text-[10.5px] tracking-[0.16em] uppercase mb-3" style={{ color: '#6366f1' }}>
              Live Conversation
            </p>
            <div className="space-y-2 mb-3">
              <div className="flex justify-end">
                <div className="text-sm px-3 py-2 rounded-2xl rounded-br-sm bg-slate-100 max-w-[85%]">
                  Do you have slots open this Thursday?
                </div>
              </div>
              <div className="flex">
                <div
                  className="text-sm text-white px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%]"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #3b82f6)' }}
                >
                  Yes — 2pm and 4:30pm are open. Want me to pencil you in?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="text-sm px-3 py-2 rounded-2xl rounded-br-sm bg-slate-100 max-w-[85%]">
                  4:30 works, I&apos;m Meera.
                </div>
              </div>
              <div className="flex">
                <div
                  className="text-sm text-white px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%]"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #3b82f6)' }}
                >
                  Booked for 4:30pm, Meera — I&apos;ll have the team confirm shortly.
                </div>
              </div>
            </div>
            <p className="text-[11px] font-mono opacity-40 border-t border-slate-100 pt-2">
              memory: name=Meera · intent=booking · slot=4:30pm
            </p>
          </div>
        </TiltCard>
      </section>

      {/* Signature: the ledger chain */}
      <section className="border-y border-slate-200 py-8 mb-16 overflow-x-auto">
        <div className="flex items-center gap-3 text-sm font-mono whitespace-nowrap">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="border border-slate-200 rounded px-3 py-1.5 opacity-80">{step}</span>
              {i < STEPS.length - 1 && <span className="opacity-30">→</span>}
            </div>
          ))}
          <span className="opacity-40 ml-2">— all one action</span>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 gap-4 mb-20">
        {FEATURES.map((f) => (
          <TiltCard key={f.title}>
            <div className="surface-card rounded-2xl px-5 py-5 h-full">
              <h3 className="font-medium mb-1.5">{f.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed">{f.body}</p>
            </div>
          </TiltCard>
        ))}
      </section>

      {/* Pricing */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold mb-6">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <TiltCard>
            <div className="surface-card rounded-2xl px-5 py-5 h-full">
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
          </TiltCard>
          <TiltCard>
            <div className="surface-card rounded-2xl px-5 py-5 h-full" style={{ borderColor: '#c7d2fe' }}>
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
          </TiltCard>
        </div>
        <p className="text-xs opacity-40 mt-4">Every plan starts with a 14-day free trial. No card required to start.</p>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-slate-200 py-12 text-center mb-8">
        <h2 className="text-2xl font-semibold mb-3">Set it up once. Let it run.</h2>
        <a href="/signup" className="inline-block btn-primary rounded px-6 py-3 text-sm font-medium">
          Start your free trial
        </a>
      </section>
    </div>
  );
}
