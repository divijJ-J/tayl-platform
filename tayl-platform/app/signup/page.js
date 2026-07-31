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
    <div className="max-w-sm mx-auto mt-16">
      <div className="rounded-2xl p-8" style={{ background: '#F5F5F7', color: '#0a0a0f' }}>
        <div className="flex justify-between items-baseline mb-1">
          <h1 className="font-display text-2xl font-bold">Get started</h1>
          <span className="text-[10.5px] tracking-[0.14em] uppercase opacity-40 font-mono">Sign up</span>
        </div>
        <p className="text-sm opacity-60 mb-6">14 days free. No card required.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Company name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2.5 mt-1 text-sm outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              required
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2.5 mt-1 text-sm outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2.5 mt-1 text-sm outline-none focus:border-violet-400"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-4 py-3 text-sm font-medium bg-[#0a0a0f] text-white disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Sign up →'}
          </button>
        </form>
        <p className="text-sm opacity-60 mt-5">
          Already have an account? <a href="/login" className="text-violet-600 font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}
