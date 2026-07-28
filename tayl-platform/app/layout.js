import './globals.css';
import { getCurrentCompanyId } from '../lib/supabase-server';
import SiteChrome from './components/SiteChrome';

export const metadata = {
  title: 'TAYL Automation Platform',
  description: 'Invoicing, proposals, tasks, and AI estimates in one place.',
};

export default async function RootLayout({ children }) {
  const { user } = await getCurrentCompanyId();

  return (
    <html lang="en">
      <body>
        <SiteChrome user={user}>{children}</SiteChrome>
      </body>
    </html>
  );
}
