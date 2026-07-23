import './globals.css';
import { getCurrentCompanyId } from '../lib/supabase-server';
import SignOutButton from './components/SignOutButton';

export const metadata = {
  title: 'TAYL Automation Platform',
  description: 'Invoicing, proposals, tasks, and AI estimates in one place.',
};

export default async function RootLayout({ children }) {
  const { user } = await getCurrentCompanyId();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <nav className="border-b border-white/10 px-6 py-4 flex gap-6 text-sm items-center">
            <a href="/" className="font-semibold">TAYL</a>
            {user ? (
              <>
                <a href="/customers" className="opacity-70 hover:opacity-100">Customers</a>
                <a href="/quotes" className="opacity-70 hover:opacity-100">Quotes</a>
                <a href="/invoices" className="opacity-70 hover:opacity-100">Invoices</a>
                <a href="/tasks" className="opacity-70 hover:opacity-100">Tasks</a>
                <a href="/estimates" className="opacity-70 hover:opacity-100">AI Estimates</a>
                <a href="/settings/services" className="opacity-70 hover:opacity-100">Pricing Catalog</a>
                <a href="/settings/payments" className="opacity-70 hover:opacity-100">Payment Settings</a>
                <span className="flex-1" />
                <SignOutButton />
              </>
            ) : (
              <>
                <span className="flex-1" />
                <a href="/login" className="opacity-70 hover:opacity-100">Log in</a>
                <a href="/signup" className="opacity-70 hover:opacity-100">Sign up</a>
              </>
            )}
          </nav>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
