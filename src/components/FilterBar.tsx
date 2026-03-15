'use client';

import { useStore } from '@/store/useStore';

export default function FilterBar() {
  const { filters, setFilters } = useStore();

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Platform</label>
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.platform}
            onChange={(e) => setFilters({ platform: e.target.value })}
          >
            <option>All</option>
            <option value="REDDIT">Reddit</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="TWITTER">Twitter</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Phrase Tier</label>
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.tier}
            onChange={(e) => setFilters({ tier: e.target.value })}
          >
            <option>All</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Min Score: {filters.minScore}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={filters.minScore}
            onChange={(e) => setFilters({ minScore: parseInt(e.target.value) })}
            className="w-24"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Team</label>
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.team}
            onChange={(e) => setFilters({ team: e.target.value })}
          >
            <option>Any</option>
            <option value="LIONS">Lions</option>
            <option value="RED_WINGS">Red Wings</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option>All</option>
            <option value="NEW">New</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="COMMENTED">Commented</option>
            <option value="DMED">DMed</option>
            <option value="CONVERTED">Converted</option>
            <option value="NOT_A_FIT">Not a Fit</option>
            <option value="CLOSED_LOST">Closed/Lost</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.dateTo}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort</label>
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
            value={filters.sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
          >
            <option value="score">Score</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
    </div>
  );
}
