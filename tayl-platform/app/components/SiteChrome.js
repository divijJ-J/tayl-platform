'use client';
import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';
import CursorGlow from './CursorGlow';

const LINKS = [
  { href: '/customers', label: 'Customers' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/estimates', label: 'AI Estimates' },
  { href: '/settings/services', label: 'Pricing Catalog' },
  { href: '/settings/knowledge', label: 'Knowledge Base' },
  { href: '/settings/calendar', label: 'Calendar' },
  { href: '/settings/chat', label: 'Chat Widget' },
  { href: '/billing', label: 'Billing' },
  { href: '/settings/payments', label: 'Payment Settings' },
];

export default function SiteChrome({ user, children }) {
  const pathname = usePathname();
  const isPublicChat = pathname?.startsWith('/chat/');

  if (isPublicChat) {
    // Public-facing widget keeps its own separate theme — no app chrome here.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <CursorGlow />
      <nav className="surface-card sticky top-0 z-40 mx-3 mt-3 md:mx-6 md:mt-4 rounded-2xl px-4 md:px-5 py-3 flex items-center gap-1 md:gap-2 overflow-x-auto">
        <a href="/" className="flex items-center gap-1.5 pr-3 mr-1 shrink-0">
          <span
            aria-hidden
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          />
          <span className="grad-text font-display font-semibold text-[15px]">TAYL</span>
        </a>

        {user ? (
          <>
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 text-[13px] px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <span className="flex-1 min-w-2" />
            <div className="shrink-0">
              <SignOutButton />
            </div>
          </>
        ) : (
          <>
            <span className="flex-1 min-w-2" />
            <a href="/login" className="shrink-0 text-[13px] px-3 py-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              Log in
            </a>
            <a href="/signup" className="btn-primary shrink-0 text-[13px] px-4 py-1.5 rounded-full font-medium">
              Sign up
            </a>
          </>
        )}
      </nav>
      <main className="p-3 md:p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
