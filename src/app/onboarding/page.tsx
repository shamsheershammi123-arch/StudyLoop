'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { DayAvailability, UserProfile } from '@/lib/types';
import { StudyStore } from '@/lib/store';

export default function OnboardingPage() {
  const router = useRouter();
  const existingProfile = StudyStore.getProfile();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(existingProfile.name || '');
  const [timezone, setTimezone] = useState<string>(existingProfile.timezone || 'America/New_York (EST)');
  const [sessionLen, setSessionLen] = useState<number>(existingProfile.preferredSessionLength || 45);
  const [breakLen, setBreakLen] = useState<number>(existingProfile.preferredBreakLength || 10);
  const [timeOfDay, setTimeOfDay] = useState<any>(existingProfile.preferredTimeOfDay || 'evening');
  const [weeklyAvailability, setWeeklyAvailability] = useState<DayAvailability[]>(
    existingProfile.weeklyAvailability || [
      { day: 'Monday', enabled: true, startTime: '17:00', endTime: '21:30', targetDailyHours: 3.5 },
      { day: 'Tuesday', enabled: true, startTime: '18:00', endTime: '22:00', targetDailyHours: 3.0 },
      { day: 'Wednesday', enabled: true, startTime: '17:00', endTime: '21:30', targetDailyHours: 3.5 },
      { day: 'Thursday', enabled: true, startTime: '18:30', endTime: '22:00', targetDailyHours: 2.5 },
      { day: 'Friday', enabled: true, startTime: '16:00', endTime: '19:30', targetDailyHours: 2.0 },
      { day: 'Saturday', enabled: true, startTime: '10:00', endTime: '16:00', targetDailyHours: 4.0 },
      { day: 'Sunday', enabled: true, startTime: '11:00', endTime: '17:00', targetDailyHours: 4.0 },
    ]
  );

  const handleFinish = () => {
    const updated: UserProfile = {
      ...existingProfile,
      name: name.trim() || 'Student',
      timezone,
      preferredSessionLength: sessionLen,
      preferredBreakLength: breakLen,
      preferredTimeOfDay: timeOfDay,
      weeklyAvailability,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    StudyStore.saveProfile(updated);
    router.push('/');
  };

  const toggleDay = (index: number) => {
    const updated = [...weeklyAvailability];
    updated[index].enabled = !updated[index].enabled;
    setWeeklyAvailability(updated);
  };

  const updateDayTimes = (index: number, startTime: string, endTime: string) => {
    const updated = [...weeklyAvailability];
    updated[index].startTime = startTime;
    updated[index].endTime = endTime;
    setWeeklyAvailability(updated);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Study Setup • Step {step} of 3</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to StudyLoop
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We build study schedules around your real life, not rigid ideals. Every field explains exactly why it helps you succeed.
        </p>
      </div>

      {/* Step 1: Profile & Timezone */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Name
                </label>
                <span className="text-[11px] text-slate-400">Why? Personalizes your workspace</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Timezone
                </label>
                <span className="text-[11px] text-slate-400">
                  Why? Ensures deadlines and reminders align with your local university schedule
                </span>
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
              >
                <option value="America/New_York (EST)">Eastern Time (America/New_York - EST/EDT)</option>
                <option value="America/Chicago (CST)">Central Time (America/Chicago - CST/CDT)</option>
                <option value="America/Denver (MST)">Mountain Time (America/Denver - MST/MDT)</option>
                <option value="America/Los_Angeles (PST)">Pacific Time (America/Los_Angeles - PST/PDT)</option>
                <option value="Europe/London (GMT)">London (Europe/London - GMT/BST)</option>
                <option value="Asia/Kolkata (IST)">India Standard Time (Asia/Kolkata - IST)</option>
                <option value="UTC">Universal Time Coordinated (UTC)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <span>Next: Pacing & Session Length</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Focus Session Length & Break Preferences */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preferred Focus Session Duration: {sessionLen} minutes
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Why? Prevents cognitive fatigue and sizes tasks realistically
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[25, 45, 60].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSessionLen(len)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      sessionLen === len
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-base">{len} mins</div>
                    <div className="text-[10px] opacity-75">
                      {len === 25 ? 'Classic Pomodoro' : len === 45 ? 'Optimal Deep Work' : 'Extended Block'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Break Length Between Sessions: {breakLen} minutes
                </label>
                <span className="text-[11px] text-slate-400">
                  Why? Allows neurotransmitter recovery
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[5, 10, 15].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBreakLen(b)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      breakLen === b
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-semibold">{b} Minutes</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Study Time of Day
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['morning', 'afternoon', 'evening'].map((tod) => (
                  <button
                    key={tod}
                    type="button"
                    onClick={() => setTimeOfDay(tod)}
                    className={`p-2.5 rounded-xl border text-center capitalize text-xs font-semibold transition-all ${
                      timeOfDay === tod
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <span>Next: Available Study Hours</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Weekly Availability Hours */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Study Windows
              </h3>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Why? Prevents schedule conflicts & never books sessions outside your free time
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Toggle which days you are available to study, and specify your active time range.
            </p>

            <div className="space-y-2.5">
              {weeklyAvailability.map((avail, idx) => (
                <div
                  key={avail.day}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                    avail.enabled
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      : 'border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-800/20 opacity-50'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold w-28">
                    <input
                      type="checkbox"
                      checked={avail.enabled}
                      onChange={() => toggleDay(idx)}
                      className="rounded text-emerald-600 accent-emerald-600"
                    />
                    <span>{avail.day}</span>
                  </label>

                  {avail.enabled ? (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <input
                        type="time"
                        value={avail.startTime}
                        onChange={(e) => updateDayTimes(idx, e.target.value, avail.endTime)}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={avail.endTime}
                        onChange={(e) => updateDayTimes(idx, avail.startTime, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Day Off (Rest)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & Go to Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

