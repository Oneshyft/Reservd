'use client';

import { useStore } from '@/store/useStore';
import LeadCard from './LeadCard';
import FilterBar from './FilterBar';

export default function LeadFeed() {
  const leads = useStore((s) => s.leads);

  return (
    <div>
      <FilterBar />
      {leads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No leads found</p>
          <p className="text-sm mt-1">Adjust your filters or run a scan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
