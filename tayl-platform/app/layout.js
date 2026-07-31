import './globals.css';
import { getCurrentCompanyId } from '../lib/supabase-server';
import { supabaseAdmin } from '../lib/supabase';
import SiteChrome from './components/SiteChrome';

export const metadata = {
  title: 'TAYL Automation Platform',
  description: 'Invoicing, proposals, tasks, and AI estimates in one place.',
};

export default async function RootLayout({ children }) {
  const { user, companyId } = await getCurrentCompanyId();

  let publicSlug = null;
  if (companyId) {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('public_slug')
      .eq('id', companyId)
      .maybeSingle();
    publicSlug = company?.public_slug || null;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SiteChrome user={user} publicSlug={publicSlug}>{children}</SiteChrome>
      </body>
    </html>
  );
}
