'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

function BellIcon({ className, ringing, style }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      style={{
        ...style,
        transformOrigin: '24px 10px',
        animation: ringing ? 'bell-ring 0.6s ease-in-out' : 'none',
      }}
    >
      <path
        d="M24 6c-1.4 0-2.5 1.1-2.5 2.5v1.6C15.9 11.4 12 15.9 12 21.3v7.4l-3.2 4.8c-.6.9 0 2.1 1.1 2.1h28.2c1.1 0 1.7-1.2 1.1-2.1L36 28.7v-7.4c0-5.4-3.9-9.9-9.5-11.2V8.5C26.5 7.1 25.4 6 24 6z"
        fill="currentColor"
      />
      <path
        d="M19 37.5a5 5 0 0 0 10 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="21" r="2.6" fill="#14211B" opacity="0.35" />
    </svg>
  );
}

export default function PublicChatPage() {
  const { slug } = useParams();
  const [companyName, setCompanyName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [started, setStarted] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ringing, setRinging] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`/api/public/company/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setNotFound(true);
          return;
        }
        setCompanyName(data.name);
        setGreeting(data.greeting);
      });
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleStart = (e) => {
    e.preventDefault();
    setMessages([{ role: 'assistant', content: greeting }]);
    setStarted(true);
    setRinging(true);
    setTimeout(() => setRinging(false), 650);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`/api/public/chat/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          visitor_name: visitorName,
          visitor_email: visitorEmail,
          message: userMsg.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setRinging(true);
      setTimeout(() => setRinging(false), 650);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry — something went wrong on our end: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const fonts = (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap"
    />
  );

  if (notFound) {
    return (
      <div style={{ background: '#14211B' }} className="min-h-screen flex items-center justify-center text-[#F6F1E4] font-[Inter,sans-serif]">
        {fonts}
        <p className="opacity-60 text-sm">This chat link doesn&apos;t exist.</p>
      </div>
    );
  }

  if (!companyName) {
    return (
      <div style={{ background: '#14211B' }} className="min-h-screen flex items-center justify-center text-[#F6F1E4]">
        {fonts}
        <p className="opacity-40 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{ background: '#14211B', fontFamily: "Inter, sans-serif" }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      {fonts}
      <style>{`
        @keyframes bell-ring {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-14deg); }
          30% { transform: rotate(11deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(-2deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        .typing-dot { animation: typing-dot 1.1s ease-in-out infinite; }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(246,241,228,0.15); border-radius: 3px; }
      `}</style>

      <div
        className="w-full max-w-md flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: '#1B2A22',
          border: '1px solid rgba(200,155,60,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          height: 'min(680px, 92vh)',
        }}
      >
        {/* Header — front desk placard */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(200,155,60,0.2)' }}
        >
          <BellIcon ringing={ringing} className="w-6 h-6 shrink-0" style={{ color: '#C89B3C' }} />
          <div className="min-w-0">
            <p
              className="truncate text-[15px] leading-tight"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#F6F1E4' }}
            >
              {companyName}
            </p>
            <p
              className="text-[10.5px] tracking-[0.14em] uppercase mt-0.5"
              style={{ color: '#C89B3C' }}
            >
              AI Receptionist
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#7FBF9E', boxShadow: '0 0 0 3px rgba(127,191,158,0.2)' }}
            />
            <span className="text-[11px]" style={{ color: 'rgba(246,241,228,0.5)' }}>
              Online now
            </span>
          </div>
        </div>

        {!started ? (
          /* Guestbook-style intro */
          <form onSubmit={handleStart} className="flex-1 flex flex-col justify-center px-7 py-8">
            <p
              className="text-[19px] leading-snug mb-1"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 500, color: '#F6F1E4' }}
            >
              Welcome — glad you stopped by.
            </p>
            <p className="text-[13px] mb-7" style={{ color: 'rgba(246,241,228,0.55)' }}>
              A quick line for the guestbook, then we&apos;ll get you sorted.
            </p>

            <label className="text-[11px] tracking-wide uppercase mb-1" style={{ color: 'rgba(246,241,228,0.4)' }}>
              Name
            </label>
            <input
              placeholder="Jordan Lee"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="bg-transparent text-[14px] pb-2 mb-5 outline-none placeholder:opacity-30"
              style={{
                color: '#F6F1E4',
                borderBottom: '1px solid rgba(246,241,228,0.25)',
              }}
            />

            <label className="text-[11px] tracking-wide uppercase mb-1" style={{ color: 'rgba(246,241,228,0.4)' }}>
              Email <span style={{ opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              placeholder="jordan@email.com"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="bg-transparent text-[14px] pb-2 mb-8 outline-none placeholder:opacity-30"
              style={{
                color: '#F6F1E4',
                borderBottom: '1px solid rgba(246,241,228,0.25)',
              }}
            />

            <button
              type="submit"
              className="rounded-full py-3 text-[14px] font-medium transition-transform active:scale-[0.98]"
              style={{ background: '#C89B3C', color: '#1B2A22' }}
            >
              Ring the bell →
            </button>
          </form>
        ) : (
          <>
            <div className="chat-scroll flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div
                      className="text-[13.5px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-br-sm max-w-[82%]"
                      style={{ background: '#3E6658', color: '#F6F1E4' }}
                    >
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-2 max-w-[85%]">
                    <div
                      className="text-[13.5px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
                      style={{
                        background: '#F6F1E4',
                        color: '#1F2A22',
                        borderLeft: '3px solid #C89B3C',
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                )
              )}
              {sending && (
                <div className="flex items-center gap-1 px-3.5 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: '#C89B3C', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: '#C89B3C', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: '#C89B3C', animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-3 flex gap-2 items-center"
              style={{ borderTop: '1px solid rgba(200,155,60,0.2)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full px-4 py-2.5 text-[13.5px] outline-none placeholder:opacity-30"
                style={{ background: 'rgba(246,241,228,0.08)', color: '#F6F1E4' }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-transform active:scale-[0.94]"
                style={{ background: '#C89B3C' }}
                aria-label="Send"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: '#1B2A22' }}>
                  <path d="M3 11.5L20 4l-6.5 17-3-7.5-7.5-2z" fill="currentColor" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-[11px] mt-4" style={{ color: 'rgba(246,241,228,0.3)' }}>
        Replies come from {companyName}&apos;s AI receptionist
      </p>
    </div>
  );
}
