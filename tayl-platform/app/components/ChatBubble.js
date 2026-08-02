'use client';
import { useState } from 'react';

// A single, clearly docked chat launcher — one button, one panel, no extra
// floating elements. Anchored to the same corner at all times.
export default function ChatBubble({ slug }) {
  const [open, setOpen] = useState(false);

  if (!slug) return null;

  return (
    <>
      {open && (
        <div
          className="fixed z-40 rounded-2xl overflow-hidden flex flex-col"
          style={{
            bottom: 20,
            right: 20,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 'min(600px, 82dvh)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            background: '#08090D',
          }}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm bg-black/40 hover:bg-black/60 text-white/80"
          >
            ×
          </button>
          <iframe
            src={`/chat/${encodeURIComponent(slug)}?embedded=1`}
            title="Chat preview"
            className="w-full h-full border-0 flex-1"
          />
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed w-14 h-14 rounded-full flex items-center justify-center z-40"
          style={{
            bottom: 20,
            right: 20,
            background: 'linear-gradient(135deg, #8b5cf6, #6d5ae6)',
            boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4c1 7 3 11 6 14 3 3 7 5 14 6-7 1-11 3-14 6-3 3-5 7-6 14-1-7-3-11-6-14-3-3-7-5-14-6 7-1 11-3 14-6 3-3 5-7 6-14z"
              fill="#ffffff"
            />
          </svg>
        </button>
      )}
    </>
  );
}
