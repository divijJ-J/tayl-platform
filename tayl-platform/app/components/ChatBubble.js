'use client';
import { useState } from 'react';

// Same floating-bubble-and-panel pattern as public/widget.js, but as a native
// React component so it can be mounted directly inside the app (e.g. so a
// business owner can preview their own chat bubble without leaving TAYL).
export default function ChatBubble({ slug }) {
  const [open, setOpen] = useState(false);

  if (!slug) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open chat preview"
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6d5ae6)',
          boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
        }}
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
