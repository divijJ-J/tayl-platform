'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function EstimatesPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []));

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription((prev) => (prev ? prev + ' ' : '') + transcript);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setEstimate(null);
    try {
      const res = await fetch('/api/estimates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_description: description,
          customer_id: selectedCustomerId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEstimate(data.estimate);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateLineItem = (idx, field, value) => {
    const next = { ...estimate };
    next.line_items[idx][field] = field === 'description' ? value : parseFloat(value) || 0;
    setEstimate(next);
  };

  const total = estimate?.line_items?.reduce((s, li) => s + li.quantity * li.unit_price, 0) || 0;

  const handleCreateQuote = async () => {
    if (!customerName) {
      setError('Enter the customer name before creating the quote');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          line_items: estimate.line_items,
          notes: `AI-generated estimate. ${estimate.notes || ''}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/quotes');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">AI Estimate Generator</h1>
      <p className="text-sm opacity-60 mb-6">
        Describe the job in plain language — pricing comes from your{' '}
        <a href="/settings/services" className="underline">Pricing Catalog</a>.
      </p>

      <form onSubmit={handleGenerate} className="space-y-3 mb-6">
        {customers.length > 0 && (
          <div>
            <label className="text-xs opacity-60 block mb-1">
              Link to existing customer (optional — uses their history for a sharper estimate)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <textarea
            required
            rows={3}
            placeholder="e.g. Customer wants their vintage watch strap replaced and the crystal polished"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm pr-12"
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleListening}
              title={listening ? 'Stop recording' : 'Speak instead of typing'}
              className={`absolute right-2 top-2 rounded-full w-8 h-8 flex items-center justify-center text-sm border ${
                listening ? 'bg-red-500 border-red-500 animate-pulse' : 'border-white/20 hover:bg-white/10'
              }`}
            >
              🎤
            </button>
          )}
        </div>
        {listening && <p className="text-xs opacity-50">Listening... click the mic again to stop.</p>}

        <button
          type="submit"
          disabled={generating}
          className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Estimate'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {estimate && (
        <div className="border border-white/10 rounded px-4 py-4 space-y-4">
          <div className="space-y-2">
            {estimate.line_items.map((li, idx) => (
              <div key={idx} className="flex gap-2 items-center text-sm">
                <input
                  value={li.description}
                  onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1"
                />
                <input
                  type="number"
                  value={li.quantity}
                  onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                  className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1"
                />
                <input
                  type="number"
                  value={li.unit_price}
                  onChange={(e) => updateLineItem(idx, 'unit_price', e.target.value)}
                  className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1"
                />
                <span className="w-20 text-right opacity-70">{(li.quantity * li.unit_price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="text-right font-semibold text-sm border-t border-white/10 pt-2">
            Total: ₹{total.toFixed(2)}
          </div>

          {estimate.notes && (
            <p className="text-xs opacity-60">Note: {estimate.notes}</p>
          )}
          {estimate.flagged_concerns && (
            <p className="text-xs text-yellow-400">⚠ {estimate.flagged_concerns}</p>
          )}

          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-sm opacity-70">Review the numbers above, then create a quote for this customer:</p>
            <input
              required
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Customer email (optional)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreateQuote}
              disabled={creating}
              className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Approve & Create Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
