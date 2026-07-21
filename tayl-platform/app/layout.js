import './globals.css';

export const metadata = {
  title: 'TAYL Automation Platform',
  description: 'Invoicing, proposals, tasks, and AI estimates in one place.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <nav className="border-b border-white/10 px-6 py-4 flex gap-6 text-sm">
            <a href="/" className="font-semibold">TAYL</a>
            <a href="/customers" className="opacity-70 hover:opacity-100">Customers</a>
            <a href="/quotes" className="opacity-70 hover:opacity-100">Quotes</a>
          </nav>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
