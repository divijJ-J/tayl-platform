'use client';
import { useState, useEffect } from 'react';

export default function ChatSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [slug, setSlug] = useState('');
  const [greeting, setGreeting] = useState('');
  const [persona, setPersona] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/chat')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSettings(data);
        setSlug(data.public_slug || '');
        setGreeting(data.chat_greeting || '');
        setPersona(data.chat_persona || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/settings/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          chat_greeting: greeting,
          chat_persona: persona,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSlug(data.public_slug);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p className="text-sm opacity-60">{error || 'Loading...'}</p>;

  const chatUrl = slug && typeof window !== 'undefined' ? `${window.location.origin}/chat/${slug}` : '';

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">AI Chat Widget</h1>
      <p className="text-sm opacity-60 mb-6">
        A shareable AI chat for your customers — answers from your{' '}
        <a href="/settings/knowledge" className="underline">Knowledge Base</a>, and every
        conversation feeds straight into customer memory.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs opacity-60 block mb-1">Public link name</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="your-business-name"
            className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs opacity-60 block mb-1">Greeting message</label>
          <input
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs opacity-60 block mb-1">Persona / tone instructions</label>
          <textarea
            rows={3}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-green-400">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      {chatUrl && (
        <>
          <div className="mt-6 border border-white/10 rounded px-4 py-3">
            <p className="text-sm opacity-70 mb-1">Your chat link:</p>
            <a href={chatUrl} target="_blank" rel="noreferrer" className="text-sm underline break-all">
              {chatUrl}
            </a>
            <p className="text-xs opacity-40 mt-2">
              Share this directly with customers.
            </p>
          </div>

          <div className="mt-4 border border-white/10 rounded px-4 py-3">
            <p className="text-sm opacity-70 mb-2">
              Or add it right on your own website — paste this before <code>&lt;/body&gt;</code>:
            </p>
            <pre className="bg-[#12131A]/5 border border-white/10 rounded px-3 py-2 text-xs overflow-x-auto">
{`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-tayl-slug="${slug}" async></script>`}
            </pre>
            <p className="text-xs opacity-40 mt-2">
              Adds a small chat bubble in the corner of your site — visitors never have to leave your page.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
