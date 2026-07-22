'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkPaidButton({ invoiceId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-paid`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 rounded px-3 py-1.5 disabled:opacity-50"
    >
      {loading ? 'Marking...' : 'Mark as Paid (test)'}
    </button>
  );
}
