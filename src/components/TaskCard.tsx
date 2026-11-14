'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play,
  MoreVertical,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Task } from '@/lib/types';
import { StudyStore } from '@/lib/store';

interface TaskCardProps {
  task: Task;
  onUpdate?: () => void;
  onSelectForFocus?: (task: Task) => void;
}

export function TaskCard({ task, onUpdate, onSelectForFocus }: TaskCardProps) {
  const isComplete = task.status === 'completed';

  const handleToggleStatus = () => {
    const nextStatus = isComplete ? 'in_progress' : 'completed';
    StudyStore.updateTask(task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    onUpdate?.();
  };

  // Calculate days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const priorityColors = {
    high: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    medium: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    low: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  };

  return (
    <div
      className={`rounded-xl border p-4.5 transition-all ${
        isComplete
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 opacity-75'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggleStatus}
            className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
              isComplete
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
            title={isComplete ? 'Mark In Progress' : 'Mark Complete'}
          >
            {isComplete && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {task.courseName}
              </span>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority} Priority
              </span>

              {task.needsReview && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center gap-1 border border-amber-300/40">
                  <AlertCircle className="w-3 h-3" />
                  Review Needed
                </span>
              )}
            </div>

            <h4
              className={`text-sm font-semibold text-slate-900 dark:text-white leading-snug ${
                isComplete ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {task.title}
            </h4>

            {task.priorityRationale && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {task.priorityRationale}
              </p>
            )}

            {/* Subtasks progress if present */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-2.5 space-y-1">
                <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>
                    Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        (task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Source Document Tag */}
            {task.sourceDocumentName && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded w-fit">
                <FileText className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{task.sourceDocumentName}</span>
                {task.pageReference && <span>• {task.pageReference}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {!isComplete && (
          <Link
            href={`/focus?taskId=${task.id}`}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Focus</span>
          </Link>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span
              className={
                diffDays < 0
                  ? 'text-rose-600 font-semibold'
                  : diffDays <= 2
                  ? 'text-amber-600 font-semibold'
                  : ''
              }
            >
              {diffDays < 0
                ? 'Overdue'
                : diffDays === 0
                ? 'Due Today'
                : diffDays === 1
                ? 'Due Tomorrow'
                : `Due in ${diffDays} days (${task.dueDate})`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{task.estimatedHours}h effort</span>
          </div>
        </div>
      </div>
    </div>
  );
}

