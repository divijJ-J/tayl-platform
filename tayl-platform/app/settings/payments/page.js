'use client';
import { useState, useEffect } from 'react';

export default function PaymentSettingsPage() {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [existingKeyId, setExistingKeyId] = useState(null);

  useEffect(() => {
    fetch('/api/gateway-keys')
      .then((r) => r.json())
      .then((data) => {
        setConnected(data.connected);
        setExistingKeyId(data.key_id);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/gateway-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId, key_secret: keySecret, webhook_secret: webhookSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('saved');
      setConnected(true);
      setExistingKeyId(keyId);
      setKeySecret('');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Payment Gateway</h1>
      <p className="text-sm opacity-60 mb-6">
        Connect your own Razorpay account so invoice payments go straight to you.
      </p>

      {connected && (
        <div className="border border-green-600/40 bg-green-600/10 rounded px-4 py-3 mb-4 text-sm">
          ✅ Connected — Key ID: <span className="font-mono">{existingKeyId}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm opacity-70">Razorpay Key ID</label>
          <input
            required
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="rzp_test_..."
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1 font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm opacity-70">Razorpay Key Secret</label>
          <input
            required
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1 font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm opacity-70">Webhook Secret (optional, add after setting up webhook)</label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1 font-mono text-sm"
          />
        </div>

        {status && status !== 'saved' && <p className="text-red-400 text-sm">{status}</p>}
        {status === 'saved' && <p className="text-green-400 text-sm">Saved.</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>

      <div className="mt-8 text-sm opacity-60 space-y-2 border-t border-white/10 pt-4">
        <p className="font-medium opacity-80">Where to find these:</p>
        <p>1. Log into your Razorpay Dashboard</p>
        <p>2. Go to Settings → API Keys → Generate Key (use Test Mode keys first)</p>
        <p>3. Copy the Key Id and Key Secret here</p>
        <p>4. For the webhook: Settings → Webhooks → Add webhook, set the URL to your app's <span className="font-mono">/api/webhooks/razorpay</span> address, and copy the secret you set there back into the field above</p>
      </div>
    </div>
  );
}
