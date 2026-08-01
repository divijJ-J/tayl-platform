'use client';
import { useState, useEffect } from 'react';

export default function TeamSettingsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('sales');
  const [sending, setSending] = useState(false);
  const [newLink, setNewLink] = useState(null);

  const load = () => {
    fetch('/api/team/members')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setNewLink(null);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, invite_role: inviteRole }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setNewLink(`${window.location.origin}/invite/${result.token}`);
      setEmail('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (error === 'Owner only') {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-xl font-semibold mb-2">Team</h1>
        <p className="text-sm text-white/50">Only the account owner can manage team members.</p>
      </div>
    );
  }

  if (!data) return <p className="text-sm text-white/50">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-xl font-semibold mb-2">Team</h1>
      <p className="text-sm text-white/50 mb-6">
        Invite teammates instead of sharing your login. <strong>Sales</strong> access covers Customers,
        Quotes, AI Estimates, and Tasks — not Billing or Settings.
      </p>

      <form onSubmit={handleInvite} className="space-y-3 mb-6 border-b border-white/10 pb-6">
        <div>
          <label className="text-xs text-white/50 block mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Access level</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-2 text-sm"
          >
            <option value="sales">Sales — Customers, Quotes, AI Estimates, Tasks</option>
            <option value="owner">Owner — full access, including Billing</option>
          </select>
        </div>
        {error && error !== 'Owner only' && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="btn-primary rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {sending ? 'Creating invite...' : 'Create invite link'}
        </button>
      </form>

      {newLink && (
        <div className="surface-card rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm text-white/70 mb-1">Send this link to them:</p>
          <p className="text-sm break-all font-mono text-violet-300">{newLink}</p>
          <p className="text-xs text-white/30 mt-2">
            It only works for the email above and can only be used once.
          </p>
        </div>
      )}

      <h2 className="text-sm font-medium text-white/70 mb-2">Current team</h2>
      <div className="space-y-2 mb-6">
        {data.members.map((m) => (
          <div key={m.user_id} className="flex justify-between items-center border border-white/10 rounded px-3 py-2 text-sm">
            <span>{m.email}</span>
            <span className="text-xs text-white/40 uppercase tracking-wide">{m.role}</span>
          </div>
        ))}
      </div>

      {data.invites.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-white/70 mb-2">Pending invites</h2>
          <div className="space-y-2">
            {data.invites.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center border border-white/10 rounded px-3 py-2 text-sm">
                <span className="text-white/60">{inv.email}</span>
                <span className="text-xs text-white/40 uppercase tracking-wide">{inv.role} · pending</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
