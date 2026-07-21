'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AcceptButton({ quoteId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to accept');
      }
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="text-sm bg-green-600/20 text-green-400 border border-green-600/40 rounded px-3 py-1.5 disabled:opacity-50"
    >
      {loading ? 'Accepting...' : 'Accept'}
    </button>
  );
}
