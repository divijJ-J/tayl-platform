'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisconnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    setLoading(true);
    await fetch('/api/calendar/disconnect', { method: 'POST' });
    router.refresh();
  };

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      className="border border-white/20 rounded px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? 'Disconnecting...' : 'Disconnect'}
    </button>
  );
}
