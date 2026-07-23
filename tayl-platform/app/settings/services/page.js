'use client';
import { useState, useEffect } from 'react';

export default function ServicesSettingsPage() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unit, setUnit] = useState('each');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => setServices(data.services || []));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, unit_price: parseFloat(unitPrice), unit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setName('');
      setDescription('');
      setUnitPrice('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch('/api/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Pricing Catalog</h1>
      <p className="text-sm opacity-60 mb-6">
        The services and prices here are what the AI Estimate Generator uses to price jobs — add your real offerings and rates.
      </p>

      <form onSubmit={handleAdd} className="space-y-3 mb-6 border-b border-white/10 pb-6">
        <input
          required
          placeholder="Service name (e.g. Watch strap replacement)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            required
            type="number"
            placeholder="Price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
          >
            <option value="each">each</option>
            <option value="hour">per hour</option>
            <option value="sqft">per sqft</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Service'}
        </button>
      </form>

      <div className="space-y-2">
        {services.length === 0 && (
          <p className="text-sm opacity-60">No services yet — add your first one above.</p>
        )}
        {services.map((s) => (
          <div key={s.id} className="flex justify-between items-center border border-white/10 rounded px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="opacity-60 text-xs">₹{s.unit_price} / {s.unit}</div>
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-red-400 text-xs">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
