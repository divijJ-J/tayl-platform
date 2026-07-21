'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '../../lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
      if (authErr) throw authErr;

      // Create the company + membership via a server route (needs service role to bypass RLS chicken-and-egg)
      const res = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authData.user?.id, company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set up company');

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-sm opacity-70">Company name</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm opacity-70">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm opacity-70">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm opacity-60 mt-4">
        Already have an account? <a href="/login" className="underline">Log in</a>
      </p>
    </div>
  );
}
