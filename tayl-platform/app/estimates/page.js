'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EstimatesPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setEstimate(null);
    try {
      const res = await fetch('/api/estimates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_description: description }),
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
        <textarea
          required
          rows={3}
          placeholder="e.g. Customer wants their vintage watch strap replaced and the crystal polished"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
        />
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
