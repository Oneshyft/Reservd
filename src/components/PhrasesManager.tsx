'use client';

import { useState } from 'react';
import { useStore, TriggerPhrase } from '@/store/useStore';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const TIER_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-gray-100 text-gray-600',
};

export default function PhrasesManager() {
  const { phrases, setPhrases } = useStore();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ text: '', tier: 'HIGH' });
  const [filterTier, setFilterTier] = useState<string>('All');

  const handleCreate = async () => {
    const res = await fetch('/api/phrases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: form.text, tier: form.tier, isActive: true }),
    });
    const phrase = await res.json();
    setPhrases([...phrases, phrase]);
    setCreating(false);
    setForm({ text: '', tier: 'HIGH' });
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/phrases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: form.text, tier: form.tier }),
    });
    const updated = await res.json();
    setPhrases(phrases.map(p => p.id === id ? { ...p, ...updated } : p));
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/phrases/${id}`, { method: 'DELETE' });
    setPhrases(phrases.filter(p => p.id !== id));
  };

  const handleToggle = async (phrase: TriggerPhrase) => {
    const res = await fetch(`/api/phrases/${phrase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !phrase.isActive }),
    });
    const updated = await res.json();
    setPhrases(phrases.map(p => p.id === phrase.id ? { ...p, ...updated } : p));
  };

  const filtered = filterTier === 'All' ? phrases : phrases.filter(p => p.tier === filterTier);

  const groups = {
    HIGH: filtered.filter(p => p.tier === 'HIGH'),
    MEDIUM: filtered.filter(p => p.tier === 'MEDIUM'),
    LOW: filtered.filter(p => p.tier === 'LOW'),
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Trigger Phrases</h2>
        <div className="flex gap-2">
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option>All</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button
            onClick={() => { setCreating(true); setForm({ text: '', tier: 'HIGH' }); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Plus className="w-4 h-4" /> Add Phrase
          </button>
        </div>
      </div>

      {creating && (
        <div className="bg-blue-50 rounded-lg p-4 flex gap-3 items-end">
          <div className="flex-1">
            <input
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              placeholder="Trigger phrase text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
          </div>
          <select
            className="border border-gray-200 rounded px-3 py-2 text-sm"
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value })}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button onClick={handleCreate} className="flex items-center gap-1 px-3 py-2 rounded bg-blue-600 text-white text-sm">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={() => setCreating(false)} className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 text-gray-700 text-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {Object.entries(groups).map(([tier, tierPhrases]) => {
        if (filterTier !== 'All' && tier !== filterTier) return null;
        if (tierPhrases.length === 0) return null;

        return (
          <div key={tier}>
            <h3 className={`text-sm font-semibold mb-2 ${tier === 'HIGH' ? 'text-red-700' : tier === 'MEDIUM' ? 'text-amber-700' : 'text-gray-600'}`}>
              {tier === 'HIGH' ? 'High Intent' : tier === 'MEDIUM' ? 'Medium Intent' : 'Low Intent'}
              <span className="font-normal text-gray-400 ml-2">({tierPhrases.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {tierPhrases.map((phrase) => (
                <div key={phrase.id} className="group relative">
                  {editing === phrase.id ? (
                    <div className="flex gap-1 items-center">
                      <input
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-48"
                        value={form.text}
                        onChange={(e) => setForm({ ...form, text: e.target.value })}
                      />
                      <select
                        className="border border-gray-200 rounded px-1 py-1 text-xs"
                        value={form.tier}
                        onChange={(e) => setForm({ ...form, tier: e.target.value })}
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                      <button onClick={() => handleUpdate(phrase.id)} className="p-1 bg-blue-600 text-white rounded">
                        <Save className="w-3 h-3" />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 bg-gray-200 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${TIER_COLORS[phrase.tier]} ${!phrase.isActive ? 'opacity-40 line-through' : ''} cursor-pointer`}
                    >
                      <span onClick={() => handleToggle(phrase)}>{phrase.text}</span>
                      <button
                        onClick={() => { setEditing(phrase.id); setForm({ text: phrase.text, tier: phrase.tier }); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/50 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(phrase.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
