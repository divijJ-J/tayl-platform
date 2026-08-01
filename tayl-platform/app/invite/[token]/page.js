'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from '../../../lib/supabase';

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const [invite, setInvite] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/team/invite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true);
        else setInvite(data);
      });
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: invite.email,
        password,
      });
      if (authErr) throw authErr;

      const res = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user_id: authData.user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <p className="text-sm text-white/60">This invite link is invalid or has already been used.</p>
      </div>
    );
  }

  if (!invite) return <p className="text-sm text-white/40 mt-16 text-center">Loading...</p>;

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="rounded-2xl p-8" style={{ background: '#F5F5F7', color: '#0a0a0f' }}>
        <h1 className="font-display text-2xl font-bold mb-1">You&apos;re invited</h1>
        <p className="text-sm opacity-60 mb-6">
          Join {invite.company_name} on TAYL as {invite.role === 'owner' ? 'a co-owner' : 'a sales team member'}.
        </p>

        <form onSubmit={handleAccept} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              disabled
              value={invite.email}
              className="w-full bg-black/5 border border-black/10 rounded-lg px-3 py-2.5 mt-1 text-sm opacity-60"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Set a password</label>
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
            {loading ? 'Setting up...' : 'Accept invite →'}
          </button>
        </form>
      </div>
    </div>
  );
}
