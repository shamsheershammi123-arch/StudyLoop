'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { StudySession } from '@/lib/types';
import { StudyStore } from '@/lib/store';

interface ScheduleTimelineProps {
  sessions: StudySession[];
  onTriggerRecovery?: (session: StudySession) => void;
  onRefresh?: () => void;
}

export function ScheduleTimeline({
  sessions,
  onTriggerRecovery,
  onRefresh,
}: ScheduleTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Group sessions by date
  const grouped: Record<string, StudySession[]> = {};
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.scheduledDate !== b.scheduledDate) {
      return a.scheduledDate.localeCompare(b.scheduledDate);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  for (const s of sortedSessions) {
    if (filter === 'today' && s.scheduledDate !== todayStr) continue;
    if (filter === 'upcoming' && s.scheduledDate < todayStr) continue;

    if (!grouped[s.scheduledDate]) {
      grouped[s.scheduledDate] = [];
    }
    grouped[s.scheduledDate].push(s);
  }

  const handleComplete = (session: StudySession) => {
    StudyStore.updateSession(session.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualMinutes: session.durationMinutes,
    });
    onRefresh?.();
  };

  const handleDelete = (session: StudySession) => {
    StudyStore.deleteSession(session.id);
    onRefresh?.();
  };

  const handleSkipOrMiss = (session: StudySession) => {
    StudyStore.updateSession(session.id, { status: 'missed' });
    onTriggerRecovery?.(session);
  };

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Scheduled ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'today'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Today's Plan ({sessions.filter((s) => s.scheduledDate === todayStr).length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'upcoming'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No study sessions in this view
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Generate an AI study plan from your tasks and availability, or add a focus session directly.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateStr, daySessions]) => {
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;

            return (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : isPast
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {formatDateLabel(dateStr)}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {dateStr}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:border-slate-800" />
                </div>

                <div className="grid gap-3">
                  {daySessions.map((session) => {
                    const isCompleted = session.status === 'completed';
                    const isMissed =
                      session.status === 'missed' || (isPast && session.status === 'scheduled');

                    return (
                      <div
                        key={session.id}
                        className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCompleted
                            ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                            : isMissed
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Course indicator pill */}
                          <div
                            className="w-2.5 self-stretch rounded-full shrink-0"
                            style={{ backgroundColor: session.courseColor || '#10b981' }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                {session.courseName}
                              </span>

                              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {session.startTime} - {session.endTime} ({session.durationMinutes}m)
                                </span>
                              </div>

                              {session.isRecovered && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300/40">
                                  Recovered Plan
                                </span>
                              )}

                              {isMissed && !isCompleted && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Needs Reschedule
                                </span>
                              )}
                            </div>

                            <h4
                              className={`text-sm font-semibold text-slate-900 dark:text-white ${
                                isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                              }`}
                            >
                              {session.taskTitle}
                            </h4>

                            {session.priorityRationale && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {session.priorityRationale}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!isCompleted && !isMissed && (
                            <Link
                              href={`/focus?sessionId=${session.id}&taskId=${session.taskId}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Start</span>
                            </Link>
                          )}

                          {!isCompleted && (
                            <button
                              onClick={() => handleComplete(session)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                              title="Mark session complete"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="hidden sm:inline">Done</span>
                            </button>
                          )}

                          {/* Plan Recovery trigger */}
                          {!isCompleted && (
                            <button
                              onClick={() => handleSkipOrMiss(session)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium flex items-center gap-1 transition-colors"
                              title="Missed or need to move this session? Rebalance with Plan Recovery without penalty."
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Recover</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(session)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

