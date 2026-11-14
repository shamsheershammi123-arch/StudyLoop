'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Battery,
  Bell,
  Layers,
  HelpCircle,
  AlertTriangle,
  Volume2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { FocusFactor, FocusReflection } from '@/lib/types';
import { StudyStore } from '@/lib/store';

interface ReflectionModalProps {
  taskId?: string;
  taskTitle?: string;
  courseName?: string;
  sessionId?: string;
  onClose: () => void;
  onSaved: (reflection: FocusReflection) => void;
}

export function ReflectionModal({
  taskId,
  taskTitle,
  courseName,
  sessionId,
  onClose,
  onSaved,
}: ReflectionModalProps) {
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [factor, setFactor] = useState<FocusFactor>('deep_flow');
  const [notes, setNotes] = useState<string>('');

  const factorOptions: {
    id: FocusFactor;
    label: string;
    icon: any;
    desc: string;
  }[] = [
    {
      id: 'deep_flow',
      label: 'Deep Flow',
      icon: Zap,
      desc: 'Focused smoothly without friction',
    },
    {
      id: 'fatigue',
      label: 'Tiredness / Low Energy',
      icon: Battery,
      desc: 'Felt drained or sleepy during session',
    },
    {
      id: 'notifications',
      label: 'Notifications / Phone',
      icon: Bell,
      desc: 'Messages or social buzzes interrupted flow',
    },
    {
      id: 'task_too_large',
      label: 'Task Felt Too Large',
      icon: Layers,
      desc: 'Overwhelmed by task scope or size',
    },
    {
      id: 'unsure_next_step',
      label: 'Unsure What To Do Next',
      icon: HelpCircle,
      desc: 'Unclear directions or missing materials',
    },
    {
      id: 'unexpected_interruption',
      label: 'Unexpected Distraction',
      icon: AlertTriangle,
      desc: 'Roommate, urgent call, or physical interruption',
    },
  ];

  const handleSave = () => {
    // Generate helpful adjustment tip based on factor
    let tip = '';
    if (factor === 'fatigue') {
      tip = 'Consider switching to 25-minute Pomodoro blocks with a brief physical walk between sessions.';
    } else if (factor === 'task_too_large') {
      tip = 'StudyLoop recommends breaking this assignment into 3 discrete micro-goals before your next session.';
    } else if (factor === 'notifications') {
      tip = 'Put your phone in another room or turn on full Do Not Disturb for your next focus block.';
    } else if (factor === 'deep_flow') {
      tip = 'Great rhythm! Your current study slot aligns well with your peak focus.';
    } else {
      tip = 'Pacing saved. StudyLoop will factor this into upcoming schedule suggestions.';
    }

    const saved = StudyStore.addReflection({
      taskId,
      taskTitle: taskTitle || 'Study Session',
      courseName,
      sessionId,
      energyLevel,
      factor,
      notes,
      aiSuggestedAdjustment: tip,
    });

    onSaved(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Quick Focus Check-in
              </h3>
              <p className="text-xs text-slate-500">
                Optional 15-second reflection to help the coach adapt your plan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Energy Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Energy Level:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {energyLevel === 5
                  ? '⚡ Peak Energy (5/5)'
                  : energyLevel === 4
                  ? '✨ High Energy (4/5)'
                  : energyLevel === 3
                  ? '🌱 Steady (3/5)'
                  : energyLevel === 2
                  ? '🥱 Low Energy (2/5)'
                  : '😴 Exhausted (1/5)'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Drained</span>
              <span>Balanced</span>
              <span>Fully Energized</span>
            </div>
          </div>

          {/* Primary Factor Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              What affected your focus the most?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {factorOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = factor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFactor(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Personal Note (Optional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mastered problem 3; struggled with formula 6"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Reflection</span>
          </button>
        </div>
      </div>
    </div>
  );
}

