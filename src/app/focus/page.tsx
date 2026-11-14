'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  Coffee,
  Sparkles,
  AlertCircle,
  Clock,
  RefreshCw,
  Award,
  ChevronDown,
} from 'lucide-react';
import { FocusLog, FocusReflection, StudySession, Task } from '@/lib/types';
import { StudyStore } from '@/lib/store';
import { playChime } from '@/components/AudioChime';
import { AmbientAudio } from '@/components/AmbientAudio';
import { HonestFocusBanner } from '@/components/HonestFocusBanner';
import { ReflectionModal } from '@/components/ReflectionModal';
import { RecoveryDiffModal } from '@/components/RecoveryDiffModal';
import { createPlanRecovery } from '@/lib/recoveryEngine';

type TimerMode = 'pomodoro' | 'stopwatch' | 'custom';

function FocusRoomContent() {
  const searchParams = useSearchParams();
  const initialTaskId = searchParams.get('taskId');
  const initialSessionId = searchParams.get('sessionId');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');
  const [sessionGoal, setSessionGoal] = useState<string>('');

  // Mode and Timer
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [totalSeconds, setTotalSeconds] = useState<number>(45 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(45 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breakLength, setBreakLength] = useState<number>(5); // 5 or 15 mins

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Post-session modals
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [completedDuration, setCompletedDuration] = useState<number>(0);
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [activeRecoveryDiff, setActiveRecoveryDiff] = useState<any | null>(null);

  // Active session details
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);

  useEffect(() => {
    const loadedTasks = StudyStore.getTasks();
    setTasks(loadedTasks);

    const profile = StudyStore.getProfile();
    const defaultLen = profile.preferredSessionLength || 45;
    setCustomMinutes(defaultLen);
    setTotalSeconds(defaultLen * 60);
    setRemainingSeconds(defaultLen * 60);

    // If initial sessionId passed, load session details
    if (initialSessionId) {
      const schedule = StudyStore.getSchedule();
      const match = schedule.find((s) => s.id === initialSessionId);
      if (match) {
        setActiveSession(match);
        setSelectedTaskId(match.taskId);
        setSessionGoal(match.sessionObjective || '');
        setRemainingSeconds(match.durationMinutes * 60);
        setTotalSeconds(match.durationMinutes * 60);
      }
    } else if (initialTaskId) {
      const matchTask = loadedTasks.find((t) => t.id === initialTaskId);
      if (matchTask) {
        setSelectedTaskId(matchTask.id);
      }
    }
  }, [initialTaskId, initialSessionId]);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  // Handle timer reaching 0
  const handleTimerComplete = () => {
    setIsRunning(false);
    playChime(isBreak ? 'break_complete' : 'focus_complete');

    if (!isBreak) {
      // Confetti celebratory burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) { }

      const focusedMins = Math.round(totalSeconds / 60);
      setCompletedDuration(focusedMins);

      // Record log in store
      StudyStore.addFocusLog({
        sessionId: activeSession?.id,
        taskId: selectedTaskId,
        taskTitle: selectedTask?.title || 'Focused Study Session',
        courseId: selectedTask?.courseId,
        courseName: selectedTask?.courseName,
        startedAt: new Date(Date.now() - totalSeconds * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        durationMinutes: focusedMins,
        targetMinutes: focusedMins,
        mode,
        completedFully: true,
        notes: sessionGoal,
      });

      // Update scheduled session if linked
      if (activeSession) {
        StudyStore.updateSession(activeSession.id, {
          status: 'completed',
          actualMinutes: focusedMins,
          completedAt: new Date().toISOString(),
        });
      }

      setShowSummary(true);
    } else {
      alert('Break is complete! Ready to start your next study block?');
      setIsBreak(false);
      setRemainingSeconds(customMinutes * 60);
    }
  };

  // Premature stop / Missed session recovery
  const handleEndEarly = () => {
    setIsRunning(false);
    const focusedSeconds = totalSeconds - remainingSeconds;
    const focusedMinutes = Math.round(focusedSeconds / 60);

    if (focusedMinutes >= 5) {
      // Still log partial progress!
      StudyStore.addFocusLog({
        sessionId: activeSession?.id,
        taskId: selectedTaskId,
        taskTitle: selectedTask?.title || 'Shortened Study Session',
        courseId: selectedTask?.courseId,
        courseName: selectedTask?.courseName,
        startedAt: new Date(Date.now() - focusedSeconds * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        durationMinutes: focusedMinutes,
        targetMinutes: Math.round(totalSeconds / 60),
        mode,
        completedFully: false,
        notes: sessionGoal ? `${sessionGoal} (Ended early)` : 'Ended early',
      });
    }

    // Offer Plan Recovery without guilt
    const recoveryDiff = createPlanRecovery({
      missedSession: activeSession || undefined,
      allSessions: StudyStore.getSchedule(),
      tasks: StudyStore.getTasks(),
      userProfile: StudyStore.getProfile(),
      triggerReason: `Session concluded early after ${focusedMinutes} minutes`,
    });

    setActiveRecoveryDiff(recoveryDiff);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
  };

  // Selected task object
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent =
    mode === 'stopwatch' ? 100 : Math.max(0, 100 - (remainingSeconds / totalSeconds) * 100);

  return (
    <div ref={containerRef} className="space-y-6 animate-fade-in relative">
      <HonestFocusBanner />

      {/* Main Focus Console */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col items-center justify-center text-center relative">
        {/* Top Controls: Soundscapes & Fullscreen */}
        <div className="w-full flex items-center justify-between mb-8">
          <AmbientAudio />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Distraction-Free Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Mode Selector */}
        {!isRunning && (
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-6 border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => {
                setMode('pomodoro');
                setIsBreak(false);
                setRemainingSeconds(25 * 60);
                setTotalSeconds(25 * 60);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${mode === 'pomodoro' && !isBreak
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Pomodoro (25m)
            </button>

            <button
              onClick={() => {
                setMode('custom');
                setIsBreak(false);
                setRemainingSeconds(customMinutes * 60);
                setTotalSeconds(customMinutes * 60);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${mode === 'custom' && !isBreak
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Custom ({customMinutes}m)
            </button>

            <button
              onClick={() => {
                setMode('stopwatch');
                setIsBreak(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${mode === 'stopwatch'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Stopwatch
            </button>

            <button
              onClick={() => {
                setIsBreak(true);
                const breakMins = 5;
                setRemainingSeconds(breakMins * 60);
                setTotalSeconds(breakMins * 60);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${isBreak
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-700 dark:text-teal-400'
                }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Break</span>
            </button>
          </div>
        )}

        {/* Linked Task & Goal Info */}
        <div className="max-w-md w-full mb-6">
          {!isRunning ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Focusing on:
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select a task to anchor this session...</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.courseName}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="Optional session goal: e.g. Finish Lineweaver-Burk chart"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {selectedTask?.courseName || 'Deep Work'}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {selectedTask?.title || 'Open Focus Block'}
              </h3>
              {sessionGoal && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: "{sessionGoal}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Large Readable Timer Display */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
            <div
              className="absolute inset-0 rounded-full border-8 border-emerald-500 transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${progressPercent > 50 ? '100% 0%, 100% 100%, 0% 100%, 0% 0%' : '100% 0%'
                  })`,
                transform: `rotate(${(progressPercent / 100) * 360}deg)`,
              }}
            />

            <div className="text-center z-10">
              <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                {mode === 'stopwatch'
                  ? formatTime(stopwatchSeconds)
                  : formatTime(remainingSeconds)}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">
                {isBreak
                  ? 'Recharge & Breathe'
                  : isRunning
                    ? 'Session in Progress'
                    : 'Ready to Start'}
              </div>
            </div>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          {!isRunning ? (
            <button
              onClick={() => {
                playChime('click');
                setIsRunning(true);
              }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Focus</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  playChime('click');
                  setIsRunning(false);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>

              <button
                onClick={handleTimerComplete}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Session</span>
              </button>

              <button
                onClick={handleEndEarly}
                className="px-4 py-3 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-semibold text-xs transition-colors"
                title="Need to stop? No penalty. StudyLoop will reallocate remaining work."
              >
                <span>End Early & Recover</span>
              </button>
            </>
          )}

          {!isRunning && (
            <button
              onClick={() => {
                setRemainingSeconds(customMinutes * 60);
                setStopwatchSeconds(0);
              }}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Session Completion Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Great Session!
            </h3>
            <p className="text-xs text-slate-500">
              You logged <strong className="text-emerald-600">{completedDuration} minutes</strong> of focused work on{' '}
              <strong>{selectedTask?.title || 'your task'}</strong>.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300">
              Taking a short 5-minute break now prevents cognitive fatigue and improves recall.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => {
                  setShowSummary(false);
                  setShowReflection(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <span>Quick Check-in (15s)</span>
              </button>

              <button
                onClick={() => setShowSummary(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Pattern Coach Check-in Modal */}
      {showReflection && (
        <ReflectionModal
          taskId={selectedTaskId}
          taskTitle={selectedTask?.title}
          courseName={selectedTask?.courseName}
          sessionId={activeSession?.id}
          onClose={() => setShowReflection(false)}
          onSaved={(ref) => {
            setShowReflection(false);
            alert('Reflection saved! Your coach will use this to fine-tune your future sessions.');
          }}
        />
      )}

      {/* Plan Recovery Diff Modal */}
      {activeRecoveryDiff && (
        <RecoveryDiffModal
          diff={activeRecoveryDiff}
          onClose={() => setActiveRecoveryDiff(null)}
          onApplied={() => {
            setActiveRecoveryDiff(null);
            alert('Schedule successfully updated! Enjoy your rest without guilt.');
          }}
        />
      )}
    </div>
  );
}

export default function FocusRoomPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-slate-500">
          Loading Focus Coach...
        </div>
      }
    >
      <FocusRoomContent />
    </React.Suspense>
  );
}
