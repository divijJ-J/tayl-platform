'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SendButton({ invoiceId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="text-sm bg-white text-black rounded px-3 py-1.5 disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Send & Get Payment Link'}
    </button>
  );
}
