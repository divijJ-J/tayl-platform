'use client';
import { useState, useEffect } from 'react';

function CopyableBox({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="bg-black/30 border border-white/10 rounded px-3 py-2 mt-1 font-mono text-xs break-all cursor-pointer hover:border-white/20"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Click to copy"
    >
      {copied ? 'Copied!' : value}
    </div>
  );
}

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
        setVerifyToken(d.verify_token || (Math.random().toString(36).slice(2, 10)));
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
      setAccessToken('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <p className="text-sm text-white/50">Loading...</p>;

  if (!data.public_slug) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-xl font-semibold mb-2">WhatsApp</h1>
        <p className="text-sm text-white/50">
          Set up your chatbot&apos;s link name in{' '}
          <a href="/settings/chat" className="underline">AI Chatbot settings</a> first, then come back here.
        </p>
      </div>
    );
  }

  const webhookUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook/${data.public_slug}` : '';

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-xl font-semibold mb-2">WhatsApp</h1>
      <p className="text-sm text-white/50 mb-1">
        Let customers message your WhatsApp number and get answered automatically — same brain as your
        website chatbot.
      </p>
      <p className="text-sm text-violet-300 mb-6">
        This is completely optional. Skip it for now if you like — your website chatbot works fine without it.
      </p>

      <div className="space-y-3 mb-8">
        <div className="surface-card rounded-2xl px-5 py-4">
          <p className="text-xs text-violet-400 mb-1">STEP 1</p>
          <p className="font-medium mb-1">Create a free Meta developer account</p>
          <p className="text-sm text-white/50 mb-2">
            This is Meta&apos;s (WhatsApp&apos;s parent company) official tool for businesses — free to use.
          </p>
          <a
            href="https://developers.facebook.com/apps"
            target="_blank"
            rel="noreferrer"
            className="text-sm underline text-violet-300"
          >
            Open developers.facebook.com/apps →
          </a>
        </div>

        <div className="surface-card rounded-2xl px-5 py-4">
          <p className="text-xs text-violet-400 mb-1">STEP 2</p>
          <p className="font-medium mb-1">Add the &quot;WhatsApp&quot; product to your app</p>
          <p className="text-sm text-white/50">
            After creating an app, look for a button to add products — choose WhatsApp.
          </p>
        </div>

        <div className="surface-card rounded-2xl px-5 py-4">
          <p className="text-xs text-violet-400 mb-1">STEP 3</p>
          <p className="font-medium mb-1">Copy two things from the &quot;Getting Started&quot; page</p>
          <p className="text-sm text-white/50">
            You&apos;ll see a <strong>Phone Number ID</strong> and a <strong>temporary access token</strong> —
            copy both, you&apos;ll paste them below.
          </p>
        </div>

        <div className="surface-card rounded-2xl px-5 py-4">
          <p className="text-xs text-violet-400 mb-1">STEP 4</p>
          <p className="font-medium mb-1">Paste this webhook URL into Meta&apos;s Configuration page</p>
          <p className="text-sm text-white/50 mb-1">This is the address Meta sends incoming messages to.</p>
          <CopyableBox value={webhookUrl} />
          <p className="text-sm text-white/50 mt-3 mb-1">
            Use this as the &quot;Verify Token&quot; there (we made one up for you, or type your own below):
          </p>
          <CopyableBox value={verifyToken} />
          <p className="text-xs text-white/30 mt-2">
            Then subscribe to the <strong>messages</strong> field — that&apos;s it for Meta&apos;s side.
          </p>
        </div>
      </div>

      <p className="text-sm font-medium mb-3">Now paste what you copied:</p>
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
          <p className="text-xs text-white/30 mt-1">Must match exactly what you pasted into Meta in Step 4.</p>
        </div>

        <div className="pt-2 border-t border-white/5">
          <label className="text-xs text-white/50 block mb-1">
            Get a WhatsApp ping for new website chats <span className="opacity-50">(optional)</span>
          </label>
          <input
            value={notifyPhone}
            onChange={(e) => setNotifyPhone(e.target.value)}
            placeholder="e.g. 919876543210"
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-white/30 mt-1">
            Your own number, country code first, no + or spaces. Only pings for new leads, not every message.
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
