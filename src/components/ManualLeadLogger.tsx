'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ClipboardPaste, Save, X } from 'lucide-react';

export default function ManualLeadLogger() {
  const { leads, setLeads } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    platform: 'FACEBOOK',
    source: '',
    author: '',
    content: '',
    url: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.content.trim()) return;
    setSaving(true);

    const res = await fetch('/api/manual-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const lead = await res.json();
    setLeads([lead, ...leads]);
    setSaving(false);
    setOpen(false);
    setForm({ platform: 'FACEBOOK', source: '', author: '', content: '', url: '', notes: '' });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-sm text-gray-700 shadow-sm"
      >
        <ClipboardPaste className="w-4 h-4" />
        Manual Lead Logger
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardPaste className="w-4 h-4" /> Manual Lead Logger
        </h3>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Paste in a post from Facebook, Twitter, or any other source to add it to your lead pipeline.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Platform</label>
          <select
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
          >
            <option value="FACEBOOK">Facebook</option>
            <option value="TWITTER">Twitter/X</option>
            <option value="REDDIT">Reddit</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Source (group/page)</label>
          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            placeholder="e.g. Detroit Sports Fans"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Author</label>
        <input
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          placeholder="Username or name"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Post Content *</label>
        <textarea
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[100px]"
          placeholder="Paste the post text here..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Post URL</label>
        <input
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Notes</label>
        <textarea
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[60px]"
          placeholder="Any additional notes..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || !form.content.trim()}
        className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Add Lead'}
      </button>
    </div>
  );
}
