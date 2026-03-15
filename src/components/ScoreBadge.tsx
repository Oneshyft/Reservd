'use client';

export default function ScoreBadge({ score }: { score: number }) {
  const getConfig = (s: number) => {
    if (s >= 8) return { label: 'Hot', bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-500' };
    if (s >= 5) return { label: 'Warm', bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-500' };
    return { label: 'Cold', bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-400' };
  };

  const config = getConfig(score);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} ring-1 ${config.ring}`}>
      {score} - {config.label}
    </span>
  );
}
