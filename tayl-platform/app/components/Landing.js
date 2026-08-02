'use client';
import TiltCard from './TiltCard';
import Reveal from './Reveal';

const TRUSTED = ['Helios', 'Kaplan', 'Oakwood', 'Stellar', 'Bright', 'Corebay', 'Northwind'];

const FEATURES = [
  {
    step: '01 — QUOTES',
    title: 'Quotes that become invoices',
    body: "Build a quote, send it, and the moment it's accepted the invoice and the follow-up task draft themselves.",
  },
  {
    step: '02 — PAYMENTS',
    title: 'Get paid without chasing',
    body: 'Connect your own payment account. Link goes out, payment comes in, invoice marks itself paid.',
  },
  {
    step: '03 — TASKS',
    title: 'A job board that fills itself',
    body: 'Every accepted quote, every paid invoice — the right task lands in the right column automatically.',
  },
  {
    step: '04 — AI ESTIMATES',
    title: 'Estimates priced from your own rates',
    body: 'Describe the job in plain language. It prices the work from your own catalog — never invents a number.',
  },
];

const WORKFLOW_STEPS = [
  { n: '01', title: 'Quote sent', body: 'You draft a quote from your catalog. Customer opens it in one click.', tag: 'tayl → send.quote' },
  { n: '02', title: 'Accepted', body: 'They tap Accept. TAYL creates the invoice and drafts the follow-up task.', tag: 'trigger → quote.accepted' },
  { n: '03', title: 'Paid', body: 'Payment link is sent. Once paid, the invoice is closed automatically.', tag: 'webhook → payment.succeeded' },
  { n: '04', title: 'Task closed', body: 'The right task lands on the right board, then closes when work is done.', tag: 'board → task.done' },
];

const STATS = [
  { value: '92%', label: 'Invoices paid within 7 days' },
  { value: '3.4x', label: 'Faster quote → cash cycle' },
  { value: '18h', label: 'Ops time saved / week / team' },
  { value: '0', label: 'Zapier flows to maintain' },
];

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-2">
      {/* Hero */}
      <section className="pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full border border-white/10 text-white/60 mb-6">
            ✨ For service businesses
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.08] mb-2">
            The paperwork
          </h1>
          <h1 className="font-accent text-4xl md:text-5xl leading-[1.08] mb-2 grad-text">
            runs itself.
          </h1>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.08] mb-6">
            You run the business.
          </h1>
          <p className="text-white/60 mb-8 max-w-md leading-relaxed">
            One accepted quote becomes an invoice, a payment link, and a tracked task — automatically.
            An AI receptionist answers your customers, remembers every conversation, and prices estimates
            from your own rates.
          </p>
          <div className="flex gap-3">
            <a href="/signup" className="btn-primary rounded-full px-5 py-3 text-sm font-medium">
              Start free — 14 days →
            </a>
            <a href="/login" className="rounded-full px-5 py-3 text-sm border border-white/15 hover:bg-white/5 transition-colors">
              Log in
            </a>
          </div>
        </div>

        {/* Live conversation demo panel */}
        <TiltCard>
          <div className="surface-card rounded-2xl p-5 h-full relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10.5px] tracking-[0.16em] uppercase text-white/50">Live Conversation</p>
              <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Auto-priced ₹12,400
              </span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-end">
                <div className="text-sm px-3 py-2 rounded-2xl rounded-br-sm bg-white/5 max-w-[85%]">
                  Do you have slots open this Thursday?
                </div>
              </div>
              <div className="flex">
                <div
                  className="text-sm text-white px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%]"
                  style={{ background: 'linear-gradient(90deg, #8b5cf6, #6d5ae6)' }}
                >
                  Yes — 2pm and 4:30pm are open. Want me to pencil you in?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="text-sm px-3 py-2 rounded-2xl rounded-br-sm bg-white/5 max-w-[85%]">
                  4:30 works, I&apos;m Meera.
                </div>
              </div>
              <div className="flex">
                <div
                  className="text-sm text-white px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%]"
                  style={{ background: 'linear-gradient(90deg, #8b5cf6, #6d5ae6)' }}
                >
                  Booked for 4:30pm, Meera — I&apos;ll have the team confirm shortly.
                </div>
              </div>
            </div>
            <p className="text-[11px] font-mono text-white/30 border-t border-white/5 pt-2">
              memory: <span className="text-white/50">name=Meera</span> · <span className="text-white/50">intent=booking</span> · <span className="text-white/50">slot=4:30pm</span>
            </p>
            <span className="absolute -bottom-3 right-4 text-[10px] px-2.5 py-1 rounded-full bg-[#12131A] border border-white/10 text-white/50">
              ● Task queued · Board → To do
            </span>
          </div>
        </TiltCard>
      </section>

      {/* Trusted by ticker */}
      <Reveal>
      <section className="py-10 border-y border-white/5">
        <p className="text-center text-[11px] tracking-[0.18em] uppercase text-white/30 mb-6">
          Trusted by service teams shipping quietly, every day
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-white/25 font-display font-semibold text-sm tracking-wide">
          {TRUSTED.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>
      </Reveal>

      {/* Feature grid */}
      <Reveal>
      <section id="features" className="pt-24 pb-16">
        <p className="text-[11px] tracking-[0.18em] uppercase text-violet-400 mb-3">Platform</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 max-w-xl">
          Operations that <span className="font-accent grad-text">quietly</span> close themselves.
        </h2>
        <p className="text-white/50 mb-10 max-w-lg">
          Four primitives, one continuous loop — from first message to task closed. No scripts. No Zapier spaghetti.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <TiltCard>
                <div className="surface-card rounded-2xl px-6 py-6 h-full">
                  <p className="text-[10.5px] tracking-[0.16em] uppercase text-white/30 mb-3">{f.step}</p>
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.body}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>
      </Reveal>

      {/* Workflow */}
      <Reveal>
      <section id="workflow" className="py-16">
        <p className="text-[11px] tracking-[0.18em] uppercase text-violet-400 mb-3">Workflow</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-10">
          One action. <span className="font-accent grad-text">Four things</span> happen.
        </h2>

        <div className="surface-card rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-4 gap-8">
            {WORKFLOW_STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <p className="text-[10.5px] tracking-[0.14em] uppercase text-white/30 mb-2">Step {s.n}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <h3 className="font-display font-semibold text-[15px]">{s.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-3">{s.body}</p>
                <span className="inline-block text-[10.5px] font-mono px-2 py-1 rounded bg-white/5 text-white/40">
                  {s.tag}
                </span>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <span className="hidden md:block absolute top-2 -right-4 text-white/20">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      {/* Stats */}
      <Reveal>
      <section className="surface-card rounded-2xl px-6 md:px-8 py-8 my-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl md:text-4xl font-bold mb-1">{s.value}</p>
            <p className="text-sm text-white/45">{s.label}</p>
          </div>
        ))}
      </section>
      </Reveal>

      {/* Pricing */}
      <Reveal>
      <section id="pricing" className="py-16">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-violet-400 mb-3">Pricing</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Fair, flat, no seat traps.</h2>
          </div>
          <p className="text-sm text-white/40 max-w-xs">
            Every plan starts with a 14-day free trial. No card required to start.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <TiltCard>
            <div className="rounded-2xl px-6 py-6 h-full" style={{ background: '#F5F5F7', color: '#0a0a0f' }}>
              <p className="font-medium text-violet-600 mb-1">Starter</p>
              <p className="font-display text-4xl font-bold mb-1">
                ₹999<span className="text-sm font-normal opacity-50">/mo</span>
              </p>
              <p className="text-sm opacity-60 mb-5">Everything to start running smoother.</p>
              <ul className="text-sm space-y-2 mb-6 opacity-80">
                <li>✓ Up to 50 customers</li>
                <li>✓ Quotes &amp; invoicing</li>
                <li>✓ Task board</li>
              </ul>
              <a href="/signup" className="block text-center rounded-full py-3 text-sm font-medium bg-[#0a0a0f] text-white">
                Start 14-day trial →
              </a>
            </div>
          </TiltCard>
          <TiltCard>
            <div className="surface-card rounded-2xl px-6 py-6 h-full relative" style={{ borderColor: 'rgba(139,92,246,0.35)' }}>
              <span className="absolute top-6 right-6 text-[10.5px] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                ● Most popular
              </span>
              <p className="font-medium text-violet-400 mb-1">Pro</p>
              <p className="font-display text-4xl font-bold mb-1">
                ₹2,499<span className="text-sm font-normal opacity-50">/mo</span>
              </p>
              <p className="text-sm text-white/50 mb-5">AI on your side, unlimited scale.</p>
              <ul className="text-sm space-y-2 mb-6 text-white/80">
                <li>✓ Unlimited customers</li>
                <li>✓ AI Estimate Generator</li>
                <li>✓ Priority support</li>
              </ul>
              <a href="/signup" className="btn-primary block text-center rounded-full py-3 text-sm font-medium">
                Start 14-day trial →
              </a>
            </div>
          </TiltCard>
        </div>
        <p className="text-center text-sm text-white/30 mt-6">
          Every plan starts with a 14-day free trial. No card required to start.
        </p>
      </section>
      </Reveal>

      {/* Final CTA */}
      <Reveal>
      <section className="py-16">
        <div
          className="rounded-2xl px-6 py-16 text-center"
          style={{ background: 'linear-gradient(135deg, #F5F5F7, #ECE9FE)', color: '#0a0a0f' }}
        >
          <p className="text-[11px] tracking-[0.18em] uppercase text-violet-600 mb-3">Ready when you are</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Set it up once. Let it run.</h2>
          <p className="opacity-60 mb-8">Every plan starts with a 14-day free trial. No card required to start.</p>
          <a href="/signup" className="inline-block rounded-full px-6 py-3 text-sm font-medium bg-[#0a0a0f] text-white">
            Start your free trial →
          </a>
        </div>
      </section>
      </Reveal>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-white/50">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="font-display font-semibold text-white">TAYL</span>
          <span>· Automation Platform</span>
        </div>
        <div className="flex gap-6 text-white/40">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">Workflow</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="/login" className="hover:text-white">Log in</a>
        </div>
        <span className="text-white/25">© 2026 TAYL</span>
      </footer>
    </div>
  );
}
