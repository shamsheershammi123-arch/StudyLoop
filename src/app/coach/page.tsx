'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Battery,
  Bell,
  Layers,
  HelpCircle,
  AlertTriangle,
  TrendingUp,
  Trash2,
  CheckCircle2,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { FocusFactor, FocusReflection } from '@/lib/types';
import { StudyStore } from '@/lib/store';
import { analyzeFocusPatterns } from '@/lib/coachEngine';

export default function CoachInsightsPage() {
  const [reflections, setReflections] = useState<FocusReflection[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  const loadData = () => {
    setReflections(StudyStore.getReflections());
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    window.addEventListener('studyloop:update', loadData);
    return () => window.removeEventListener('studyloop:update', loadData);
  }, []);

  if (!mounted) return null;

  const analysis = analyzeFocusPatterns(reflections);

  const factorLabels: Record<FocusFactor, { label: string; icon: any; color: string }> = {
    deep_flow: { label: 'Deep Flow', icon: Zap, color: 'text-emerald-500' },
    fatigue: { label: 'Tiredness / Low Energy', icon: Battery, color: 'text-amber-500' },
    notifications: { label: 'Notifications / Phone', icon: Bell, color: 'text-rose-500' },
    task_too_large: { label: 'Task Felt Too Large', icon: Layers, color: 'text-violet-500' },
    unsure_next_step: { label: 'Unsure What To Do Next', icon: HelpCircle, color: 'text-blue-500' },
    unexpected_interruption: { label: 'Unexpected Interruption', icon: AlertTriangle, color: 'text-orange-500' },
    environment_noise: { label: 'Environment Noise', icon: Bell, color: 'text-slate-500' },
    other: { label: 'Other', icon: HelpCircle, color: 'text-slate-400' },
  };

  const handleApplyAdjustment = (actionType: string) => {
    const profile = StudyStore.getProfile();
    if (actionType === 'shorten_session') {
      profile.preferredSessionLength = 25;
      profile.preferredBreakLength = 5;
      StudyStore.saveProfile(profile);
      alert('Updated your default session preference to 25-minute Pomodoros!');
    } else {
      alert('Noted! Future study schedule generations will prioritize this pacing.');
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete your check-in reflection history? This action is permanent and upholds your privacy.')) {
      StudyStore.clearReflections();
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Focus Pattern Coach
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Personalized AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Detects subtle friction patterns across your study sessions and suggests realistic micro-adjustments so you study with ease.
          </p>
        </div>

        {reflections.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Coach History</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Average Session Energy</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {analysis.averageEnergy} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Based on {analysis.totalReflections} completed check-ins
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Top Focus Factor</span>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1 capitalize truncate">
            {analysis.topFactor ? factorLabels[analysis.topFactor]?.label : 'None logged yet'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Primary influencer of your recent momentum
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Pacing Health</span>
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            Adaptive
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Zero cramming, healthy break intervals
          </p>
        </div>
      </div>

      {/* Coach Actionable Recommendations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Tailored Coach Recommendations</span>
        </h3>

        <div className="grid gap-3">
          {analysis.insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {insight.headline}
                </h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-fit">
                  {insight.category.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {insight.observation}
              </p>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Suggested Adjustment:</span>
                  <span>{insight.suggestedAction}</span>
                </div>
                <button
                  onClick={() => handleApplyAdjustment(insight.actionType)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors"
                >
                  Apply to Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Factor Frequency Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {Object.entries(analysis.factorCounts).map(([key, count]) => {
            const meta = factorLabels[key as FocusFactor] || {
              label: key,
              icon: HelpCircle,
              color: 'text-slate-500',
            };
            const Icon = meta.icon;
            return (
              <div
                key={key}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {meta.label}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {count} session{count !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Check-ins Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Recent Check-in Logs ({reflections.length})
        </h3>

        {reflections.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-6">
            No check-ins logged yet. Complete a study session in the Focus Room to begin building your pattern insights.
          </p>
        ) : (
          <div className="space-y-3">
            {reflections.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>{ref.taskTitle || 'Study Session'}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(ref.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  <span className="text-emerald-600 font-bold">
                    Energy: {ref.energyLevel}/5
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    Factor: {factorLabels[ref.factor]?.label || ref.factor}
                  </span>
                </div>

                {ref.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    "{ref.notes}"
                  </p>
                )}

                {ref.aiSuggestedAdjustment && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    💡 <strong>Coach Note:</strong> {ref.aiSuggestedAdjustment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

