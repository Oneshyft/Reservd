'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore, OutreachTemplate, OutreachEvent } from '@/store/useStore';
import { X, Copy, Check, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function OutreachPanel() {
  const { selectedLead, showOutreachPanel, setShowOutreachPanel, templates, updateLeadStatus } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate | null>(null);
  const [replyText, setReplyText] = useState('');
  const [method, setMethod] = useState<'COMMENT' | 'DM'>('COMMENT');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [outreachHistory, setOutreachHistory] = useState<OutreachEvent[]>([]);
  const [sending, setSending] = useState(false);

  const findBestTemplate = useCallback(() => {
    const phrases: string[] = selectedLead ? JSON.parse(selectedLead.matchedPhrases || '[]') : [];
    if (!templates.length || !phrases.length) return null;

    let bestTemplate: OutreachTemplate | null = null;
    let bestScore = 0;

    for (const template of templates) {
      const triggerTags: string[] = JSON.parse(template.triggerTags || '[]');
      const score = triggerTags.reduce((acc, tag) => {
        return acc + (phrases.some(p => p.toLowerCase().includes(tag.toLowerCase())) ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }

    return bestTemplate;
  }, [templates, selectedLead]);

  useEffect(() => {
    if (showOutreachPanel && selectedLead) {
      const best = findBestTemplate();
      if (best) {
        setSelectedTemplate(best);
        let text = best.bodyText;
        // Fill in variables
        if (selectedLead.team === 'LIONS' || selectedLead.team === 'BOTH') {
          text = text.replace(/\{\{team\}\}/g, 'Detroit Lions');
          text = text.replace(/\{\{venue\}\}/g, 'Ford Field');
        } else if (selectedLead.team === 'RED_WINGS') {
          text = text.replace(/\{\{team\}\}/g, 'Detroit Red Wings');
          text = text.replace(/\{\{venue\}\}/g, 'Little Caesars Arena');
        }
        text = text.replace(/\{\{package_type\}\}/g, 'shared suite');
        setReplyText(text);
      }

      // Fetch outreach history
      fetch(`/api/outreach?leadId=${selectedLead.id}`)
        .then(res => res.json())
        .then(setOutreachHistory)
        .catch(() => setOutreachHistory([]));
    }
  }, [showOutreachPanel, selectedLead, findBestTemplate]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setReplyText(template.bodyText);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkContacted = async () => {
    if (!selectedLead) return;
    setSending(true);

    await fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: selectedLead.id,
        templateId: selectedTemplate?.id,
        method,
        notes,
      }),
    });

    updateLeadStatus(selectedLead.id, method === 'DM' ? 'DMED' : 'COMMENTED');
    setSending(false);
    setShowOutreachPanel(false);
  };

  if (!showOutreachPanel || !selectedLead) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-gray-800">Draft Reply</h2>
        <button onClick={() => setShowOutreachPanel(false)} className="p-1 hover:bg-gray-200 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Original post */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">
            {selectedLead.source} - {selectedLead.author}
          </div>
          <p className="text-sm text-gray-800">{selectedLead.content}</p>
        </div>

        {/* Template selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <select
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white"
            value={selectedTemplate?.id || ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">Select a template...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Reply text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reply</label>
          <textarea
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[150px] resize-y"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        {/* Method selector */}
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="COMMENT"
              checked={method === 'COMMENT'}
              onChange={() => setMethod('COMMENT')}
            />
            Comment
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="DM"
              checked={method === 'DM'}
              onChange={() => setMethod('DM')}
            />
            DM
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[60px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes..."
          />
        </div>

        {/* Mark as Contacted */}
        <button
          onClick={handleMarkContacted}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Saving...' : 'Mark as Contacted'}
        </button>

        {/* Outreach History */}
        {outreachHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Outreach History</h3>
            <div className="space-y-2">
              {outreachHistory.map((event) => (
                <div key={event.id} className="bg-gray-50 rounded p-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{event.method}</span>
                  </div>
                  {event.template && <div className="text-gray-600 mt-1">Template: {event.template.name}</div>}
                  {event.notes && <div className="text-gray-600 mt-1">{event.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
