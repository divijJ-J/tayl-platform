'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQuotePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = field === 'description' ? value : parseFloat(value) || 0;
    setItems(next);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const afterDiscount = subtotal - discount;
  const total = afterDiscount + afterDiscount * (taxRate / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          tax_rate: taxRate,
          discount,
          notes,
          line_items: items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      router.push('/quotes');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">New Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm opacity-70">Customer name</label>
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm opacity-70">Customer email (optional)</label>
          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm opacity-70 block mb-2">Line items</label>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  className="w-20 bg-black/30 border border-white/10 rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Unit price"
                  value={item.unit_price}
                  onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                  className="w-28 bg-black/30 border border-white/10 rounded px-3 py-2"
                />
                <span className="w-24 text-sm opacity-70 text-right">
                  {(item.quantity * item.unit_price).toFixed(2)}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-red-400 text-sm px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="text-sm mt-2 opacity-70 hover:opacity-100 underline"
          >
            + Add line item
          </button>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-sm opacity-70">Tax rate %</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-24 bg-black/30 border border-white/10 rounded px-3 py-2 mt-1 block"
            />
          </div>
          <div>
            <label className="text-sm opacity-70">Discount (flat)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-24 bg-black/30 border border-white/10 rounded px-3 py-2 mt-1 block"
            />
          </div>
        </div>

        <div>
          <label className="text-sm opacity-70">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 mt-1"
            rows={2}
          />
        </div>

        <div className="border-t border-white/10 pt-4 text-sm space-y-1">
          <div className="flex justify-between opacity-70">
            <span>Subtotal</span><span>{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Discount</span><span>-{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Tax ({taxRate}%)</span><span>{(afterDiscount * (taxRate / 100)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span><span>{total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-white text-black rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Create Quote'}
        </button>
      </form>
    </div>
  );
}
