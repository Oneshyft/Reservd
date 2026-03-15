'use client';

import { useState } from 'react';
import { useStore, Lead } from '@/store/useStore';
import { KANBAN_COLUMNS } from '@/lib/constants';
import ScoreBadge from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Facebook, Twitter, GripVertical, X } from 'lucide-react';

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'REDDIT': return <MessageCircle className="w-3 h-3 text-orange-500" />;
    case 'FACEBOOK': return <Facebook className="w-3 h-3 text-blue-600" />;
    case 'TWITTER': return <Twitter className="w-3 h-3 text-sky-500" />;
    default: return null;
  }
};

function KanbanCard({ lead, onDragStart, onClick }: { lead: Lead; onDragStart: (e: React.DragEvent, lead: Lead) => void; onClick: (lead: Lead) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onClick(lead)}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3 h-3 text-gray-300" />
          <PlatformIcon platform={lead.platform} />
          <span className="text-xs text-gray-500">{lead.source}</span>
        </div>
        <ScoreBadge score={lead.score} />
      </div>
      <div className="text-xs text-gray-600 mb-1">{lead.author}</div>
      <p className="text-xs text-gray-800 line-clamp-2 mb-2">{lead.content}</p>
      <div className="text-xs text-gray-400">
        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
      </div>
    </div>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Lead Detail</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={lead.platform} />
            <span className="text-sm font-medium">{lead.source}</span>
            <span className="text-sm text-gray-500">by {lead.author}</span>
          </div>
          <ScoreBadge score={lead.score} />
          <p className="text-sm text-gray-800">{lead.content}</p>
          <div className="flex flex-wrap gap-1">
            {JSON.parse(lead.matchedPhrases || '[]').map((p: string, i: number) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{p}</span>
            ))}
          </div>
          {lead.notes && (
            <div className="bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Notes</div>
              <p className="text-sm">{lead.notes}</p>
            </div>
          )}
          <a href={lead.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
            Open Original Post
          </a>
        </div>
      </div>
    </div>
  );
}

export default function KanbanView() {
  const { leads, updateLeadStatus } = useStore();
  const [expandedLead, setExpandedLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('leadId', lead.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    updateLeadStatus(leadId, columnId);
    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: columnId }),
    });
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnLeads = leads.filter(l => l.status === column.id);
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{column.label}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {columnLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={handleDragStart}
                    onClick={setExpandedLead}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {expandedLead && <LeadDetail lead={expandedLead} onClose={() => setExpandedLead(null)} />}
    </>
  );
}
