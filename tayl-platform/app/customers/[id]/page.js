'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [log, setLog] = useState([]);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCustomer(data.customer);
        setLog(data.log);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await fetch(`/api/customers/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      setNote('');
      load();
    } finally {
      setAddingNote(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${id}/summarize`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  if (!customer) return <p className="text-sm opacity-60">{error || 'Loading...'}</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">{customer.name}</h1>
      <p className="text-sm opacity-60 mb-6">{customer.email || 'No email on file'}</p>

      <div className="border border-white/10 rounded px-4 py-3 mb-6">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h2 className="text-sm font-medium opacity-80">AI Memory Summary</h2>
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="text-xs border border-white/15 rounded px-3 py-1 hover:bg-[#12131A]/5 disabled:opacity-50 shrink-0"
          >
            {summarizing ? 'Thinking...' : 'Refresh Summary'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
        {customer.ai_summary ? (
          <>
            <p className="text-sm opacity-90">{customer.ai_summary}</p>
            <p className="text-xs opacity-40 mt-2">
              Updated {new Date(customer.ai_summary_updated_at).toLocaleString()}
            </p>
          </>
        ) : (
          <p className="text-sm opacity-50">No summary yet — click Refresh Summary once there's history.</p>
        )}
      </div>

      <form onSubmit={handleAddNote} className="space-y-2 mb-6">
        <label className="text-sm opacity-70">Add a note</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-2 text-sm"
          placeholder="e.g. Prefers morning appointments, allergic to latex gloves"
        />
        <button
          type="submit"
          disabled={addingNote}
          className="border border-white/15 rounded px-4 py-2 text-sm hover:bg-[#12131A]/5 disabled:opacity-50"
        >
          {addingNote ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      <h2 className="text-sm font-medium opacity-80 mb-2">History</h2>
      <div className="space-y-2">
        {log.length === 0 && <p className="text-sm opacity-50">No history yet.</p>}
        {log.map((l) => (
          <div key={l.id} className="border border-white/10 rounded px-3 py-2 text-sm">
            <div className="flex justify-between text-xs opacity-40 mb-1">
              <span>{l.type}</span>
              <span>{new Date(l.created_at).toLocaleString()}</span>
            </div>
            {l.subject && <div className="font-medium text-xs opacity-70">{l.subject}</div>}
            <div className="opacity-80">{l.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
