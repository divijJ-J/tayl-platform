'use client';
import { useState, useEffect } from 'react';

export default function ChatSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
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
        setDisplayName(data.ai_display_name || '');
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
          ai_display_name: displayName,
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

  if (!settings) return <p className="text-sm text-white/50">{error || 'Loading...'}</p>;

  const chatUrl = slug && typeof window !== 'undefined' ? `${window.location.origin}/chat/${slug}` : '';

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-xl font-semibold mb-2">AI Chatbot</h1>
      <p className="text-sm text-white/50 mb-6">
        This is your one AI chatbot — the same bubble you see in the corner of TAYL right now. Set it up
        here, and it&apos;s ready everywhere.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Your business name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Sunrise Cleaning Co."
            className="w-full bg-[#12131A] border border-white/10 rounded-lg px-3 py-2.5 text-sm"
          />
          <p className="text-xs text-white/30 mt-1">What the chatbot calls itself when talking to customers.</p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Greeting message</label>
          <input
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Hi! How can I help you today?"
            className="w-full bg-[#12131A] border border-white/10 rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            Link name <span className="text-white/30 font-normal">(letters/numbers only)</span>
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="your-business-name"
            className="w-full bg-[#12131A] border border-white/10 rounded-lg px-3 py-2.5 text-sm"
          />
          <p className="text-xs text-white/30 mt-1">A short web address for your chatbot — needed for it to work.</p>
        </div>

        <details className="border border-white/10 rounded-lg">
          <summary className="cursor-pointer text-sm px-3 py-2.5 select-none text-white/60 hover:text-white/90">
            Tone / persona (optional, advanced)
          </summary>
          <div className="px-3 pb-3">
            <textarea
              rows={3}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g. Be warm and casual, keep answers short."
              className="w-full bg-[#12131A] border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </details>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-green-400">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      {chatUrl && (
        <details className="mt-8 border border-white/10 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium px-4 py-3 select-none text-white/70 hover:text-white">
            Advanced: put this chatbot on your own website too
          </summary>
          <div className="px-4 pb-4 space-y-4">
            <div>
              <p className="text-sm text-white/50 mb-1">Shareable link:</p>
              <a href={chatUrl} target="_blank" rel="noreferrer" className="text-sm underline break-all text-violet-300">
                {chatUrl}
              </a>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-2">
                Or paste this code into your website, right before <code>&lt;/body&gt;</code>:
              </p>
              <pre className="bg-black/30 border border-white/10 rounded px-3 py-2 text-xs overflow-x-auto">
{`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-tayl-slug="${slug}" async></script>`}
              </pre>
              <p className="text-xs text-white/30 mt-2">
                This adds the exact same chat bubble to your own site, so visitors never have to leave your page.
              </p>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
