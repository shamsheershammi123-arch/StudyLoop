'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export function HonestFocusBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3.5 mb-6 text-xs text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
            StudyLoop Honest In-App Focus:
          </span>{' '}
          A web application cannot reliably freeze or block third-party operating system apps on your computer.
          Instead of making false security claims, StudyLoop provides a genuine distraction-free in-browser environment:
          fullscreen view, synthesized ambient soundscapes, pacing timers, and zero-guilt session recovery.
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-emerald-700/60 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

