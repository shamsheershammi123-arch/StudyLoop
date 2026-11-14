'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  RefreshCw,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { RecoveryDiff, StudySession, Task, UserProfile } from '@/lib/types';
import { StudyStore } from '@/lib/store';
import { createPlanRecovery } from '@/lib/recoveryEngine';
import { RecoveryDiffModal } from '@/components/RecoveryDiffModal';

export default function RecoveryCenterPage() {
  const [profile, setProfile] = useState<UserProfile>(StudyStore.getProfile());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [recoveryDiff, setRecoveryDiff] = useState<RecoveryDiff | null>(null);
  const [selectedSessionToRecover, setSelectedSessionToRecover] = useState<string>('all');
  const [userNote, setUserNote] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const loadData = () => {
    setProfile(StudyStore.getProfile());
    setTasks(StudyStore.getTasks());
    setSessions(StudyStore.getSchedule());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('studyloop:update', loadData);
    return () => window.removeEventListener('studyloop:update', loadData);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Find missed or slipped sessions
  const missedOrPastSessions = sessions.filter(
    (s) => s.status === 'missed' || s.status === 'skipped' || (s.scheduledDate < todayStr && s.status === 'scheduled')
  );

  const handleGenerateRecovery = async () => {
    setIsGenerating(true);
    try {
      const target =
        selectedSessionToRecover === 'all'
          ? missedOrPastSessions[0]
          : sessions.find((s) => s.id === selectedSessionToRecover);

      // Try server AI endpoint first
      const res = await fetch('/api/gemini/recover-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missedSession: target || sessions[0],
          allSessions: sessions,
          tasks,
          userProfile: profile,
          reason: userNote || 'Schedule rebalancing request',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.recoveryDiff) {
          setRecoveryDiff(data.recoveryDiff);
          return;
        }
      }

      // Deterministic fallback
      const diff = createPlanRecovery({
        missedSession: target,
        allSessions: sessions,
        tasks,
        userProfile: profile,
        triggerReason: userNote || 'Schedule rebalancing request',
      });
      setRecoveryDiff(diff);
    } catch (e) {
      console.warn('Fallback recovery:', e);
      const diff = createPlanRecovery({
        allSessions: sessions,
        tasks,
        userProfile: profile,
        triggerReason: userNote || 'Schedule rebalancing request',
      });
      setRecoveryDiff(diff);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Recovery Banner Header */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Plan Recovery Center
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Core Differentiator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              StudyLoop never punishes you with shame, broken streak anxiety, or impossible backlogs. When life gets in the way, our AI rebuilds a realistic, conflict-free schedule so you stay calm.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateRecovery}
          disabled={isGenerating}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Rebalancing...' : 'Generate New Realistic Plan'}</span>
        </button>
      </div>

      {/* Slipped Sessions Detection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Sessions Eligible for Recovery
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {missedOrPastSessions.length} sessions detected
          </span>
        </div>

        {missedOrPastSessions.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-center text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold">Your schedule is currently up to date!</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              You have no past-due or missed study blocks. If you ever need to reschedule upcoming sessions in advance, you can do so here anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {missedOrPastSessions.map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {session.taskTitle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                      {session.courseName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Was scheduled for {session.scheduledDate} at {session.startTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedSessionToRecover(session.id);
                    handleGenerateRecovery();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors self-end sm:self-center"
                >
                  Reschedule This Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Philosophy Card */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>The StudyLoop Recovery Guarantee</span>
        </h4>
        <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
          <li><strong>No punitive streak breaks:</strong> Missing a session does not erase your historical momentum or efforts.</li>
          <li><strong>Realistic spacing:</strong> Sessions are moved into genuinely open slots in your weekly availability—never piled onto a single sleepless night.</li>
          <li><strong>Student confirmation required:</strong> The AI proposes changes with transparent rationale, but nothing is changed until you click "Apply".</li>
        </ul>
      </div>

      {/* Recovery Diff Modal */}
      {recoveryDiff && (
        <RecoveryDiffModal
          diff={recoveryDiff}
          onClose={() => setRecoveryDiff(null)}
          onApplied={() => {
            setRecoveryDiff(null);
            loadData();
            alert('Your study schedule has been revitalized! Great job staying flexible.');
          }}
        />
      )}
    </div>
  );
}

