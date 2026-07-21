'use client';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '../../lib/supabase';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={handleSignOut} className="opacity-70 hover:opacity-100 text-sm">
      Sign out
    </button>
  );
}
