'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

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
  const bottomRef = useRef(null);

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
  }, [messages]);

  const handleStart = (e) => {
    e.preventDefault();
    setMessages([{ role: 'assistant', content: greeting }]);
    setStarted(true);
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
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="opacity-60 text-sm">This chat link doesn&apos;t exist.</p>
      </div>
    );
  }

  if (!companyName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="opacity-60 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto">
      <div className="border-b border-white/10 px-4 py-3">
        <h1 className="text-sm font-medium">{companyName}</h1>
      </div>

      {!started ? (
        <form onSubmit={handleStart} className="flex-1 flex flex-col justify-center px-6 space-y-3">
          <p className="text-sm opacity-70 mb-2">Quick intro before we chat (optional):</p>
          <input
            placeholder="Your name"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Your email"
            value={visitorEmail}
            onChange={(e) => setVisitorEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-white text-black rounded px-4 py-2 text-sm font-medium"
          >
            Start Chat
          </button>
        </form>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded max-w-[85%] ${
                  m.role === 'user' ? 'bg-white text-black ml-auto' : 'bg-white/10'
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && <div className="text-xs opacity-40">Typing...</div>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-white/10 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
