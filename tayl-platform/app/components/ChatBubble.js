'use client';
import { useState, useEffect } from 'react';

// Same floating-bubble-and-panel pattern as public/widget.js, but as a native
// React component so it can be mounted directly inside the app (e.g. so a
// business owner can preview their own chat bubble without leaving TAYL).
export default function ChatBubble({ slug }) {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    if (!slug) return undefined;
    const timer = setTimeout(() => setShowGreeting(true), 1400);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!slug) return null;

  const handleOpen = () => {
    setOpen(true);
    setShowGreeting(false);
  };

  return (
    <>
      {showGreeting && !open && (
        <div
          className="fixed bottom-24 right-5 z-40 max-w-[240px] rounded-2xl rounded-br-sm px-4 py-3 text-sm"
          style={{ background: '#12131A', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}
        >
          <button
            onClick={() => setShowGreeting(false)}
            aria-label="Dismiss"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/10 hover:bg-white/20 text-white/70"
          >
            ×
          </button>
          <p className="text-white/90">Hey, Taylan here 👋</p>
          <p className="text-white/50 mt-0.5">I may be able to help — ask me anything.</p>
        </div>
      )}

      <button
        onClick={handleOpen}
        aria-label="Open chat preview"
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-shadow"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6d5ae6)',
          boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,92,246,0.5)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.35)')}
      >
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4c1 7 3 11 6 14 3 3 7 5 14 6-7 1-11 3-14 6-3 3-5 7-6 14-1-7-3-11-6-14-3-3-7-5-14-6 7-1 11-3 14-6 3-3 5-7 6-14z"
            fill="#ffffff"
          />
        </svg>
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-5 rounded-2xl overflow-hidden z-40"
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 560,
            maxHeight: 'calc(100vh - 140px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            background: '#08090D',
          }}
        >
          <iframe
            src={`/chat/${encodeURIComponent(slug)}?embedded=1`}
            title="Chat preview"
            className="w-full h-full border-0"
          />
        </div>
      )}
    </>
  );
}
