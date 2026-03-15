'use client';

import { AlertTriangle } from 'lucide-react';

export default function ComplianceBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <p className="text-xs text-amber-800">
        <strong>Compliance Reminder:</strong> Always disclose you&apos;re promoting a product. Follow each platform&apos;s self-promotion rules. Never spam. Vary your reply wording across posts.
      </p>
    </div>
  );
}
