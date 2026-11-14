'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  User,
  Clock,
  Calendar,
  Key,
  Database,
  Trash2,
  Download,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Course, UserProfile } from '@/lib/types';
import { StudyStore } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(StudyStore.getProfile());
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [sessionLen, setSessionLen] = useState<number>(45);
  const [breakLen, setBreakLen] = useState<number>(10);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // New course state
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('#10b981');

  useEffect(() => {
    const p = StudyStore.getProfile();
    setProfile(p);
    setName(p.name);
    setTimezone(p.timezone);
    setSessionLen(p.preferredSessionLength);
    setBreakLen(p.preferredBreakLength);
    setCourses(StudyStore.getCourses());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name,
      timezone,
      preferredSessionLength: sessionLen,
      preferredBreakLength: breakLen,
    };
    StudyStore.saveProfile(updated);
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseCode.trim()) return;

    StudyStore.addCourse({
      name: newCourseName.trim(),
      code: newCourseCode.trim().toUpperCase(),
      color: newCourseColor,
    });

    setCourses(StudyStore.getCourses());
    setNewCourseName('');
    setNewCourseCode('');
  };

  const handleExportData = () => {
    const data = {
      profile: StudyStore.getProfile(),
      courses: StudyStore.getCourses(),
      tasks: StudyStore.getTasks(),
      schedule: StudyStore.getSchedule(),
      reflections: StudyStore.getReflections(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyLoop_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleResetDemo = () => {
    if (confirm('Reset workspace to standard prototype sample courses and tasks?')) {
      StudyStore.resetToSampleData();
      window.location.reload();
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Permanently delete all tasks, uploaded documents, and study records? This cannot be undone.')) {
      StudyStore.clearAllUserData();
      window.location.href = '/onboarding';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your study parameters, manage active courses, or manage data privacy.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-300/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-500" />
          <span>Student Profile & Pacing</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Focus Session Length (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="120"
                step="5"
                value={sessionLen}
                onChange={(e) => setSessionLen(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Break Length (Minutes)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                step="1"
                value={breakLen}
                onChange={(e) => setBreakLen(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Link
              href="/onboarding"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Re-run Onboarding Wizard →
            </Link>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Courses Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Active Courses ({courses.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {course.code}
                  </span>
                  <span className="text-[11px] text-slate-500">{course.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Course Form */}
        <form onSubmit={handleAddCourse} className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="Course Code (e.g. PHY 102)"
            value={newCourseCode}
            onChange={(e) => setNewCourseCode(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
          <input
            type="text"
            required
            placeholder="Course Title (e.g. Intro Physics)"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Add Course
          </button>
        </form>
      </div>

      {/* Backend & Integration Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>System Status & Services</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Gemini AI Integration</span>
              <span className="text-emerald-600 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Model: <code className="font-mono">gemini-3.8-flash</code> via secure server routes.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Postgres & Supabase Storage</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSupabaseConfigured ? 'Live & Connected' : 'Local Persistent'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isSupabaseConfigured
                ? 'Cloud database connected (chvnlbwbxnhxiwuwrduj.supabase.co)'
                : 'Multi-tenant Postgres / Supabase schema provided in repository.'}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>Privacy & Data Management</span>
        </h3>
        <p className="text-xs text-slate-500">
          In compliance with hackathon privacy guidelines, you have total ownership of your documents, check-ins, and study schedules.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Data (JSON)</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Prototype Sample Data</span>
          </button>

          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All My Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

