'use client';
import { useState } from 'react';

export default function CopyLink({ link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm bg-blue-600/20 text-blue-400 border border-blue-600/40 rounded px-3 py-1.5"
    >
      {copied ? 'Copied!' : 'Copy Payment Link'}
    </button>
  );
}
