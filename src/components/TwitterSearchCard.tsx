'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Twitter } from 'lucide-react';

const TWITTER_SEARCHES = [
  '"Detroit Lions suite" OR "Ford Field suite"',
  '"Lions season tickets" OR "Red Wings season tickets"',
  '"Lions waitlist" OR "Lions waiting list"',
  '"can\'t afford season tickets" Detroit',
  '"suite rental" Detroit OR "rent a suite" Detroit',
  '"client entertainment" Detroit OR "team outing" Detroit',
  '"stubhub" "Lions" OR "stubhub" "Red Wings"',
  '"LCA suite" OR "Little Caesars Arena suite"',
];

export default function TwitterSearchCard() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Check if Twitter token is configured
    fetch('/api/settings?key=twitter_configured')
      .then(() => setHasToken(false)) // We can't actually check env vars from client
      .catch(() => setHasToken(false));
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <Twitter className="w-4 h-4 text-sky-500" />
        Twitter/X Search
      </h3>

      {hasToken === false && (
        <div className="bg-sky-50 border border-sky-200 rounded p-3 mb-3">
          <p className="text-xs text-sky-800 mb-2">
            <strong>Live monitoring not enabled.</strong> Set TWITTER_BEARER_TOKEN in .env to enable automated Twitter scanning.
          </p>
          <p className="text-xs text-sky-700">
            Get a token at <span className="font-mono">developer.twitter.com</span> → Projects &amp; Apps → Keys and tokens.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-3">
        Use these search queries in Twitter Advanced Search:
      </p>

      <div className="space-y-1">
        {TWITTER_SEARCHES.map((query, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
            <code className="text-xs text-gray-700 break-all">{query}</code>
            <button
              onClick={() => handleCopy(query, i)}
              className="p-1 hover:bg-gray-200 rounded flex-shrink-0 ml-2"
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
