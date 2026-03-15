'use client';

import { Lead, useStore } from '@/store/useStore';
import ScoreBadge from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, MessageSquare, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/constants';

function highlightPhrases(text: string, phrases: string[]): React.ReactNode {
  if (!phrases.length) return text;

  const parts: { start: number; end: number; phrase: string }[] = [];

  for (const phrase of phrases) {
    const lower = text.toLowerCase();
    let idx = lower.indexOf(phrase.toLowerCase());
    while (idx !== -1) {
      parts.push({ start: idx, end: idx + phrase.length, phrase });
      idx = lower.indexOf(phrase.toLowerCase(), idx + 1);
    }
  }

  if (!parts.length) return text;

  // Sort by start position and merge overlapping
  parts.sort((a, b) => a.start - b.start);
  const merged: typeof parts = [parts[0]];
  for (let i = 1; i < parts.length; i++) {
    const last = merged[merged.length - 1];
    if (parts[i].start <= last.end) {
      last.end = Math.max(last.end, parts[i].end);
    } else {
      merged.push(parts[i]);
    }
  }

  const elements: React.ReactNode[] = [];
  let pos = 0;
  merged.forEach((part, i) => {
    if (part.start > pos) {
      elements.push(text.slice(pos, part.start));
    }
    elements.push(
      <mark key={i} className="highlight">{text.slice(part.start, part.end)}</mark>
    );
    pos = part.end;
  });
  if (pos < text.length) elements.push(text.slice(pos));

  return <>{elements}</>;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'REDDIT': return <MessageCircle className="w-4 h-4 text-orange-500" />;
    case 'FACEBOOK': return <Facebook className="w-4 h-4 text-blue-600" />;
    case 'TWITTER': return <Twitter className="w-4 h-4 text-sky-500" />;
    default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
  }
};

export default function LeadCard({ lead }: { lead: Lead }) {
  const { setSelectedLead, setShowOutreachPanel, updateLeadStatus } = useStore();
  const matchedPhrases: string[] = JSON.parse(lead.matchedPhrases || '[]');

  const handleDraftReply = () => {
    setSelectedLead(lead);
    setShowOutreachPanel(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    updateLeadStatus(lead.id, newStatus);
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const getTierColor = (phrase: string) => {
    const lower = phrase.toLowerCase();
    // Simple heuristic - in production you'd check against DB
    const highIndicators = ['suite', 'season ticket', 'waitlist', 'afford', 'ford field', 'lca', 'detroit', 'lions', 'red wings', 'selling', 'need tickets', 'looking for tickets', '313 presents'];
    const medIndicators = ['first', 'team outing', 'client', 'holiday', 'group', 'stubhub', 'expensive', 'thinking about', 'season ticket holder', 'psl', 'deposit'];
    if (highIndicators.some(h => lower.includes(h))) return 'bg-red-100 text-red-700';
    if (medIndicators.some(m => lower.includes(m))) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={lead.platform} />
          <span className="text-sm font-medium text-gray-700">{lead.source}</span>
          <span className="text-xs text-gray-400">by {lead.author}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(lead.postTimestamp), { addSuffix: true })}
          </span>
        </div>
        <ScoreBadge score={lead.score} />
      </div>

      <p className="text-sm text-gray-800 mb-3 line-clamp-3">
        {highlightPhrases(lead.content, matchedPhrases)}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {matchedPhrases.map((phrase, i) => (
          <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(phrase)}`}>
            {phrase}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {lead.team && lead.team !== 'UNKNOWN' && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {lead.team === 'BOTH' ? 'Lions + Wings' : lead.team === 'LIONS' ? 'Lions' : 'Red Wings'}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Open Post
          </a>
          <button
            onClick={handleDraftReply}
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <MessageSquare className="w-3 h-3" /> Draft Reply
          </button>
        </div>
      </div>
    </div>
  );
}
