'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  BookOpen,
  PlusCircle,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { Course, StudySession, Task, UserProfile } from '@/lib/types';
import { StudyStore } from '@/lib/store';
import { TaskCard } from '@/components/TaskCard';
import { HonestFocusBanner } from '@/components/HonestFocusBanner';
import { RecoveryDiffModal } from '@/components/RecoveryDiffModal';
import { createPlanRecovery } from '@/lib/recoveryEngine';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile>(StudyStore.getProfile());
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeRecoveryDiff, setActiveRecoveryDiff] = useState<any | null>(null);

  const loadData = () => {
    setProfile(StudyStore.getProfile());
    setCourses(StudyStore.getCourses());
    setTasks(StudyStore.getTasks());
    setSessions(StudyStore.getSchedule());
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    window.addEventListener('studyloop:update', loadData);
    return () => window.removeEventListener('studyloop:update', loadData);
  }, []);

  if (!mounted) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's study sessions
  const todaysSessions = sessions.filter((s) => s.scheduledDate === todayStr);
  const nextSession = todaysSessions.find((s) => s.status === 'scheduled');

  // Lapsed or missed sessions requiring recovery
  const missedSessions = sessions.filter(
    (s) => s.status === 'missed' || (s.scheduledDate < todayStr && s.status === 'scheduled')
  );

  // Focus metrics
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalFocusMinutes = completedSessions.reduce(
    (acc, s) => acc + (s.actualMinutes || s.durationMinutes),
    0
  );
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

  // Upcoming deadlines in next 7 days
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Trigger Plan Recovery
  const handleStartRecovery = (targetSession?: StudySession) => {
    const diff = createPlanRecovery({
      missedSession: targetSession || missedSessions[0],
      allSessions: sessions,
      tasks,
      userProfile: profile,
      triggerReason: targetSession
        ? `Missed session "${targetSession.taskTitle}"`
        : 'Rebalancing past-due study schedule',
    });
    setActiveRecoveryDiff(diff);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <HonestFocusBanner />

      {/* Plan Recovery Alert Banner (The Differentiator) */}
      {missedSessions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <RefreshCw className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Schedule slipped? No guilt, let's recover.
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {missedSessions.length} session{missedSessions.length > 1 ? 's' : ''} to adjust
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Life happens. StudyLoop can smoothly reallocate your remaining workload across upcoming available hours without cramming.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStartRecovery()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Review Recovery Plan</span>
          </button>
        </div>
      )}

      {/* Hero Next Session Card */}
      <section className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for focused momentum</span>
          </div>

          {nextSession ? (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Next scheduled session • {nextSession.startTime} ({nextSession.durationMinutes} mins)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 tracking-tight">
                {nextSession.taskTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mb-6">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 font-medium">
                  {nextSession.courseName}
                </span>
                <span>•</span>
                <span>{nextSession.priorityRationale}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/focus?sessionId=${nextSession.id}&taskId=${nextSession.taskId}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Next Session</span>
                </Link>

                <Link
                  href="/tasks"
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
                >
                  View Full Schedule
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 tracking-tight">
                All caught up for today!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-6">
                You've completed all scheduled blocks for today. Want to start an ad-hoc session or plan ahead for tomorrow?
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/focus"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Quick Focus Session</span>
                </Link>

                <Link
                  href="/materials"
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
                >
                  Upload New Syllabus
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Focus This Week</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalFocusHours} <span className="text-xs font-normal text-slate-500">hours</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {completedSessions.length} sessions completed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Today's Sessions</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {todaysSessions.filter((s) => s.status === 'completed').length}/{todaysSessions.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {todaysSessions.filter((s) => s.status === 'scheduled').length} remaining today
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((t) => t.status !== 'completed').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {tasks.filter((t) => t.status === 'completed').length} finished
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Plan Recoveries</span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {sessions.filter((s) => s.isRecovered).length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            Zero deadlines compromised
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Schedule & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Study Plan
                </h3>
                <p className="text-xs text-slate-500">
                  {todaysSessions.length} focus blocks planned according to your available hours
                </p>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Edit Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todaysSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium">No sessions scheduled for today</p>
                <Link
                  href="/tasks"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                >
                  Generate Plan with AI
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSessions.map((session) => {
                  const isDone = session.status === 'completed';
                  return (
                    <div
                      key={session.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isDone
                          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full"
                          style={{ backgroundColor: session.courseColor || '#10b981' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              {session.courseName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <h4
                            className={`text-sm font-semibold text-slate-900 dark:text-white ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {session.taskTitle}
                          </h4>
                        </div>
                      </div>

                      {!isDone ? (
                        <Link
                          href={`/focus?sessionId=${session.id}&taskId=${session.taskId}`}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start</span>
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Syllabus Upload Prompt Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Got a new syllabus or assignment sheet?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                  Upload a PDF or image and Gemini will extract course deadlines, required topics, and source excerpts for your review.
                </p>
              </div>
            </div>
            <Link
              href="/materials"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Material</span>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Course Progress */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Upcoming Deadlines</span>
              <span className="text-[11px] font-semibold text-emerald-600">Next 7 Days</span>
            </h3>

            <div className="space-y-3">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.courseName}
                    </span>
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      Due {t.dueDate}
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {t.title}
                  </h5>
                </div>
              ))}
            </div>

            <Link
              href="/tasks"
              className="mt-4 block text-center py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View All Tasks ({tasks.length})
            </Link>
          </div>

          {/* Progress by Course */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Progress by Course
            </h3>

            <div className="space-y-4">
              {courses.map((course) => {
                const courseTasks = tasks.filter((t) => t.courseName === course.code || t.courseId === course.id);
                const completedCount = courseTasks.filter((t) => t.status === 'completed').length;
                const pct = courseTasks.length > 0 ? Math.round((completedCount / courseTasks.length) * 100) : 0;

                return (
                  <div key={course.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {course.code}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px]">
                        {completedCount}/{courseTasks.length} tasks ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: course.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Recovery Diff Modal */}
      {activeRecoveryDiff && (
        <RecoveryDiffModal
          diff={activeRecoveryDiff}
          onClose={() => setActiveRecoveryDiff(null)}
          onApplied={() => {
            setActiveRecoveryDiff(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

