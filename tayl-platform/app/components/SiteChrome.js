'use client';
import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';
import CursorGlow from './CursorGlow';
import ChatBubble from './ChatBubble';

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
  { href: '/settings/whatsapp', label: 'WhatsApp' },
  { href: '/billing', label: 'Billing' },
  { href: '/settings/payments', label: 'Payment Settings' },
];

export default function SiteChrome({ user, publicSlug, children }) {
  const pathname = usePathname();
  const isPublicChat = pathname?.startsWith('/chat/');

  if (isPublicChat) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <CursorGlow />
      <nav className="border-b border-white/10 px-4 md:px-6 py-4 flex items-center gap-1 md:gap-2 overflow-x-auto">
        <a href="/" className="flex items-center gap-2 pr-4 mr-1 shrink-0">
          <span
            aria-hidden
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}
          />
          <span className="font-display font-semibold text-[15px] tracking-wide">TAYL</span>
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
                    active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
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
            <a href="#features" className="shrink-0 text-[13px] px-3 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5">
              Features
            </a>
            <a href="#workflow" className="shrink-0 text-[13px] px-3 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5">
              Workflow
            </a>
            <a href="#pricing" className="shrink-0 text-[13px] px-3 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5">
              Pricing
            </a>
            <span className="flex-1 min-w-2" />
            <a href="/login" className="shrink-0 text-[13px] px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              Log in
            </a>
            <a href="/signup" className="btn-primary shrink-0 text-[13px] px-4 py-2 rounded-full">
              Sign up →
            </a>
          </>
        )}
      </nav>
      <main className="p-3 md:p-6 max-w-6xl mx-auto">{children}</main>
      {user && publicSlug && <ChatBubble slug={publicSlug} />}
    </div>
  );
}
