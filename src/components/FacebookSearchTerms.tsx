'use client';

import { useState } from 'react';
import { FACEBOOK_SEARCH_TERMS } from '@/lib/constants';
import { Copy, Check, Facebook } from 'lucide-react';

export default function FacebookSearchTerms() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (term: string, index: number) => {
    navigator.clipboard.writeText(term);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <Facebook className="w-4 h-4 text-blue-600" />
        Facebook Search Terms
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Copy these terms to search in Facebook Groups manually (automated scraping not supported due to TOS).
      </p>
      <div className="space-y-1">
        {FACEBOOK_SEARCH_TERMS.map((term, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
            <span className="text-sm text-gray-700">{term}</span>
            <button
              onClick={() => handleCopy(term, i)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {copiedIndex === i ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
