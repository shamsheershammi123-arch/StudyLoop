'use client';

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  HeartHandshake,
  ShieldAlert,
} from 'lucide-react';
import { RecoveryDiff } from '@/lib/types';
import { StudyStore } from '@/lib/store';

interface RecoveryDiffModalProps {
  diff: RecoveryDiff;
  onClose: () => void;
  onApplied: () => void;
}

export function RecoveryDiffModal({ diff, onClose, onApplied }: RecoveryDiffModalProps) {
  const handleApply = () => {
    // Commit the proposed sessions to store
    StudyStore.saveSchedule(diff.proposedSessions);
    onApplied();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Plan Recovery: Real-time Schedule Rebalance
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  Zero Guilt
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {diff.triggerReason || 'Adjusting your study schedule realistically'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Supportive Agent Message */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl p-4 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3 leading-relaxed">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>{diff.supportiveMessage}</div>
          </div>

          {/* Schedule Diff Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Proposed Schedule Changes ({diff.affectedSessions.length})
            </h4>

            {diff.affectedSessions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No schedule modifications needed. Your current calendar has enough buffer to absorb this.
              </p>
            ) : (
              <div className="space-y-3">
                {diff.affectedSessions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <span>{item.taskTitle}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.courseName}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-300">
                      {/* Old */}
                      <div className="flex items-center gap-1.5 opacity-60 line-through">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span>{item.oldDate}</span>
                        <span className="font-mono">({item.oldTime})</span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 hidden sm:block shrink-0" />

                      {/* New */}
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.newDate}</span>
                        <span className="font-mono">({item.newTime})</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Why this works: </span>
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Keep Existing Schedule
          </button>

          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Revised Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}

