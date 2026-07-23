'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscribeButton({ plan, current }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (current) {
    return (
      <span className="block text-center text-sm bg-green-600/20 text-green-400 border border-green-600/40 rounded px-3 py-1.5">
        Current Plan
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full text-sm bg-white text-black rounded px-3 py-1.5 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Subscribe (test)'}
    </button>
  );
}
