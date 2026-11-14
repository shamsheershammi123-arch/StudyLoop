'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  RefreshCw,
  X,
} from 'lucide-react';
import { Course, StudySession, Task, UserProfile } from '@/lib/types';
import { StudyStore } from '@/lib/store';
import { TaskCard } from '@/components/TaskCard';
import { ScheduleTimeline } from '@/components/ScheduleTimeline';
import { generateStudySchedule } from '@/lib/scheduler';
import { RecoveryDiffModal } from '@/components/RecoveryDiffModal';
import { createPlanRecovery } from '@/lib/recoveryEngine';

export default function TasksAndPlanPage() {
  const [profile, setProfile] = useState<UserProfile>(StudyStore.getProfile());
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks'>('schedule');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeRecoveryDiff, setActiveRecoveryDiff] = useState<any | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS 201');
  const [newDueDate, setNewDueDate] = useState('2026-11-24');
  const [newHours, setNewHours] = useState(3.0);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const loadData = () => {
    setProfile(StudyStore.getProfile());
    setCourses(StudyStore.getCourses());
    setTasks(StudyStore.getTasks());
    setSessions(StudyStore.getSchedule());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('studyloop:update', loadData);
    return () => window.removeEventListener('studyloop:update', loadData);
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterCourse !== 'all' && t.courseName !== filterCourse) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  // Generate / Regenerate Study Plan using availability and tasks
  const handleGeneratePlan = () => {
    const newSchedule = generateStudySchedule({
      userProfile: profile,
      tasks,
      daysAhead: 14,
      existingSessions: sessions.filter((s) => s.status === 'completed'),
    });

    StudyStore.saveSchedule(newSchedule);
    alert(`Generated ${newSchedule.length} focus sessions tailored to your available study windows!`);
    loadData();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    StudyStore.addTask({
      title: newTitle.trim(),
      courseId: `course_${newCourse.toLowerCase().replace(/\s+/g, '')}`,
      courseName: newCourse,
      dueDate: newDueDate,
      estimatedHours: newHours,
      priority: newPriority,
      status: 'not_started',
      priorityRationale: `User-created assignment due on ${newDueDate}.`,
      subtasks: [
        { id: `st_${Date.now()}_1`, title: 'Core preparation & notes', completed: false },
        { id: `st_${Date.now()}_2`, title: 'Execution & review', completed: false },
      ],
    });

    setNewTitle('');
    setShowAddModal(false);
    loadData();
  };

  const handleTriggerRecovery = (session: StudySession) => {
    const diff = createPlanRecovery({
      missedSession: session,
      allSessions: sessions,
      tasks,
      userProfile: profile,
      triggerReason: `Rescheduling missed session for ${session.courseName}`,
    });
    setActiveRecoveryDiff(diff);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Study Plan & Task Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Slices your coursework into realistic focus sessions aligned with your available hours and deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={handleGeneratePlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Schedule Plan</span>
          </button>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Study Schedule ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Task List ({tasks.length})</span>
          </button>
        </div>

        {activeTab === 'tasks' && (
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Pane */}
      {activeTab === 'schedule' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Generated Focus Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Sessions are placed within your configured daily windows ({profile.preferredSessionLength}m blocks, {profile.preferredBreakLength}m breaks) without conflicts.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Active
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Recovered
              </span>
            </div>
          </div>

          <ScheduleTimeline
            sessions={sessions}
            onTriggerRecovery={handleTriggerRecovery}
            onRefresh={loadData}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={loadData} />
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Course Task / Milestone
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Problem Set 5: Graph Traversals"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newHours}
                    onChange={(e) => setNewHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

