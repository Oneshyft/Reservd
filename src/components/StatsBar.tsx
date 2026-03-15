'use client';

import { useStore } from '@/store/useStore';
import { TrendingUp, Flame, Thermometer, Snowflake, BarChart3 } from 'lucide-react';

export default function StatsBar() {
  const stats = useStore((s) => s.stats);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Today / This Week', value: `${stats.todayLeads} / ${stats.weekLeads}`, icon: BarChart3, color: 'text-blue-600' },
    { label: 'Hot Leads', value: stats.hot, icon: Flame, color: 'text-green-600' },
    { label: 'Warm Leads', value: stats.warm, icon: Thermometer, color: 'text-amber-500' },
    { label: 'Cold Leads', value: stats.cold, icon: Snowflake, color: 'text-gray-500' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-purple-600', sub: stats.mostActiveSubreddit },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            {item.label}
          </div>
          <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
          {item.sub && <div className="text-xs text-gray-400 truncate">Top: {item.sub}</div>}
        </div>
      ))}
    </div>
  );
}
