'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
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
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <span className="text-[10.5px] tracking-[0.14em] uppercase opacity-40 font-mono">Log in</span>
        </div>
        <p className="text-sm opacity-60 mb-6">Sign in to your workspace.</p>

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? 'Logging in...' : 'Log in →'}
          </button>
        </form>
        <p className="text-sm opacity-60 mt-5">
          New to TAYL? <a href="/signup" className="text-violet-600 font-medium">Create an account</a>
        </p>
      </div>
    </div>
  );
}
