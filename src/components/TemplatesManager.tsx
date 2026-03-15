'use client';

import { useState } from 'react';
import { useStore, OutreachTemplate } from '@/store/useStore';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function TemplatesManager() {
  const { templates, setTemplates } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', triggerTags: '', bodyText: '' });

  const handleCreate = async () => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        triggerTags: JSON.stringify(form.triggerTags.split(',').map(t => t.trim()).filter(Boolean)),
        bodyText: form.bodyText,
      }),
    });
    const template = await res.json();
    setTemplates([...templates, template]);
    setCreating(false);
    setForm({ name: '', triggerTags: '', bodyText: '' });
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        triggerTags: JSON.stringify(form.triggerTags.split(',').map(t => t.trim()).filter(Boolean)),
        bodyText: form.bodyText,
      }),
    });
    const updated = await res.json();
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updated } : t));
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    setTemplates(templates.filter(t => t.id !== id));
  };

  const startEdit = (template: OutreachTemplate) => {
    setEditing(template.id);
    const tags: string[] = JSON.parse(template.triggerTags || '[]');
    setForm({ name: template.name, triggerTags: tags.join(', '), bodyText: template.bodyText });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Outreach Templates</h2>
        <button
          onClick={() => { setCreating(true); setForm({ name: '', triggerTags: '', bodyText: '' }); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {creating && (
        <TemplateForm
          form={form}
          setForm={setForm}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            {editing === template.id ? (
              <TemplateForm
                form={form}
                setForm={setForm}
                onSave={() => handleUpdate(template.id)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-800">{template.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {JSON.parse(template.triggerTags || '[]').map((tag: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Used {template.usageCount}x</span>
                    <button onClick={() => startEdit(template)} className="p-1 hover:bg-gray-100 rounded">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(template.id)} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{template.bodyText}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateForm({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: { name: string; triggerTags: string; bodyText: string };
  setForm: (f: { name: string; triggerTags: string; bodyText: string }) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
      <input
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        placeholder="Template name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        placeholder="Trigger tags (comma-separated)"
        value={form.triggerTags}
        onChange={(e) => setForm({ ...form, triggerTags: e.target.value })}
      />
      <textarea
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[100px]"
        placeholder="Template body text. Use {{team}}, {{venue}}, {{package_type}} for variables."
        value={form.bodyText}
        onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
      />
      <div className="flex gap-2">
        <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-sm">
          <Save className="w-4 h-4" /> Save
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-200 text-gray-700 text-sm">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
