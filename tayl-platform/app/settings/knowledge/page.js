'use client';
import { useState, useEffect, useRef } from 'react';

export default function KnowledgeSettingsPage() {
  const [sources, setSources] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const load = () => {
    fetch('/api/knowledge')
      .then((r) => r.json())
      .then((data) => setSources(data.sources || []));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, source_type: 'text' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle('');
      setContent('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!/\.(txt|md)$/i.test(file.name)) {
      setError('Only .txt or .md files are supported right now — paste other content as text instead.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: file.name, content: text, source_type: 'file' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Knowledge Base</h1>
      <p className="text-sm opacity-60 mb-6">
        Add company policies, standard practices, or past job notes here — the AI Estimate Generator
        uses this alongside your pricing catalog to make sharper, better-informed estimates.
      </p>

      <form onSubmit={handleAdd} className="space-y-3 mb-4 border-b border-white/10 pb-6">
        <input
          className="w-full bg-transparent border border-white/15 rounded px-3 py-2 text-sm"
          placeholder="Title (e.g. Warranty Policy)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full bg-transparent border border-white/15 rounded px-3 py-2 text-sm"
          placeholder="Paste text here..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="border border-white/15 rounded px-4 py-2 text-sm hover:bg-[#12131A]/5 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Text Entry'}
        </button>
      </form>

      <div className="mb-6 pb-6 border-b border-white/10">
        <label className="text-sm opacity-70 block mb-2">Or upload a .txt / .md file:</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFile}
          disabled={loading}
          className="text-sm"
        />
      </div>

      <div className="space-y-3">
        {sources.length === 0 && <p className="text-sm opacity-50">No knowledge added yet.</p>}
        {sources.map((s) => (
          <div key={s.id} className="border border-white/10 rounded px-3 py-2 flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {s.title} <span className="opacity-40 text-xs">({s.source_type})</span>
              </p>
              <p className="text-xs opacity-50 truncate">{s.content.slice(0, 120)}</p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              className="text-xs opacity-60 hover:opacity-100 shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
