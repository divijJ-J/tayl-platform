'use client';
import { useState, useEffect } from 'react';

export default function WhatsAppSettingsPage() {
  const [data, setData] = useState(null);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setPhoneNumberId(d.phone_number_id || '');
        setVerifyToken(d.verify_token || '');
        setNotifyPhone(d.notify_phone || '');
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: phoneNumberId, access_token: accessToken, verify_token: verifyToken, notify_phone: notifyPhone }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setSaved(true);
      setAccessToken(''); // don't keep the token sitting in the input after save
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <p className="text-sm opacity-60">Loading...</p>;

  if (!data.public_slug) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-xl font-semibold mb-2">WhatsApp</h1>
        <p className="text-sm text-white/50">
          Set up your public link name in{' '}
          <a href="/settings/chat" className="underline">Chat Widget settings</a> first — WhatsApp reuses
          the same link so we know which business a message belongs to.
        </p>
      </div>
    );
  }

  const webhookUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook/${data.public_slug}` : '';

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-xl font-semibold mb-2">WhatsApp</h1>
      <p className="text-sm text-white/50 mb-6">
        Connect your own WhatsApp Business number via Meta&apos;s official Cloud API. Replies use the
        same Knowledge Base and Customer Memory as your website chat.
      </p>

      <div className="surface-card rounded-2xl px-5 py-4 mb-6 text-sm">
        <p className="font-medium mb-2">Setup steps</p>
        <ol className="list-decimal list-inside space-y-1.5 text-white/60">
          <li>
            Create a free app at{' '}
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="underline">
              developers.facebook.com/apps
            </a>{' '}
            → add the <strong>WhatsApp</strong> product
          </li>
          <li>Copy the <strong>Phone Number ID</strong> and a <strong>temporary access token</strong> from the WhatsApp → Getting Started page</li>
          <li>Pick any random string as your <strong>Verify Token</strong> — you choose this, it just has to match below</li>
          <li>
            In Meta&apos;s WhatsApp → Configuration page, set the webhook URL to:
            <div className="bg-[#12131A]/5 border border-white/10 rounded px-3 py-2 mt-1 font-mono text-xs break-all">
              {webhookUrl}
            </div>
          </li>
          <li>Use the same Verify Token there, and subscribe to the <strong>messages</strong> field</li>
        </ol>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs text-white/50 block mb-1">Phone Number ID</label>
          <input
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">
            Access Token {data.connected && <span className="opacity-50">(leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Verify Token</label>
          <input
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="pt-2 border-t border-white/5">
          <label className="text-xs text-white/50 block mb-1">
            Notify me on WhatsApp for new website chats <span className="opacity-50">(optional)</span>
          </label>
          <input
            value={notifyPhone}
            onChange={(e) => setNotifyPhone(e.target.value)}
            placeholder="e.g. 919876543210"
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-white/30 mt-1">
            Your own number, with country code, no + or spaces. You&apos;ll get a WhatsApp message the moment
            a new visitor starts a chat on your website — not for every message, just new leads.
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-green-400">Saved.</p>}

        <button type="submit" disabled={saving} className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      {data.connected && (
        <p className="text-xs text-white/40 mt-4">✓ WhatsApp is connected for this business.</p>
      )}
    </div>
  );
}
