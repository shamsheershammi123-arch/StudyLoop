'use client';

import {
  Course,
  FocusLog,
  FocusReflection,
  RecoveryDiff,
  StudySession,
  Task,
  UploadedMaterial,
  UserProfile,
} from './types';
import {
  INITIAL_COURSES,
  INITIAL_REFLECTIONS,
  INITIAL_SCHEDULE,
  INITIAL_TASKS,
  INITIAL_USER_PROFILE,
} from './sampleData';

const STORAGE_KEYS = {
  PROFILE: 'studyloop_profile_v1',
  COURSES: 'studyloop_courses_v1',
  TASKS: 'studyloop_tasks_v1',
  SCHEDULE: 'studyloop_schedule_v1',
  FOCUS_LOGS: 'studyloop_focus_logs_v1',
  REFLECTIONS: 'studyloop_reflections_v1',
  MATERIALS: 'studyloop_materials_v1',
  ACTIVE_FOCUS: 'studyloop_active_focus_v1',
};

// Dispatch change event for reactive components
function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('studyloop:update'));
  }
}

// Safely read from localStorage with fallback
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage:`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyChange();
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage:`, e);
  }
}

export const StudyStore = {
  // User Profile
  getProfile(): UserProfile {
    return getLocalItem<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
  },
  saveProfile(profile: UserProfile): void {
    profile.updatedAt = new Date().toISOString();
    setLocalItem(STORAGE_KEYS.PROFILE, profile);
  },

  // Courses
  getCourses(): Course[] {
    return getLocalItem<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },
  saveCourses(courses: Course[]): void {
    setLocalItem(STORAGE_KEYS.COURSES, courses);
  },
  addCourse(course: Omit<Course, 'id'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...course,
      id: `course_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    courses.push(newCourse);
    this.saveCourses(courses);
    return newCourse;
  },

  // Tasks
  getTasks(): Task[] {
    return getLocalItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  saveTasks(tasks: Task[]): void {
    setLocalItem(STORAGE_KEYS.TASKS, tasks);
  },
  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },
  updateTask(taskId: string, patch: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...patch };
    this.saveTasks(tasks);
    return tasks[idx];
  },
  deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    this.saveTasks(tasks);

    // Also remove or flag orphaned sessions
    const sessions = this.getSchedule().filter((s) => s.taskId !== taskId);
    this.saveSchedule(sessions);
  },

  // Schedule & Study Sessions
  getSchedule(): StudySession[] {
    return getLocalItem<StudySession[]>(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE);
  },
  saveSchedule(sessions: StudySession[]): void {
    setLocalItem(STORAGE_KEYS.SCHEDULE, sessions);
  },
  updateSession(sessionId: string, patch: Partial<StudySession>): StudySession | null {
    const sessions = this.getSchedule();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) return null;
    sessions[idx] = { ...sessions[idx], ...patch };
    this.saveSchedule(sessions);
    return sessions[idx];
  },
  deleteSession(sessionId: string): void {
    const sessions = this.getSchedule().filter((s) => s.id !== sessionId);
    this.saveSchedule(sessions);
  },

  // Focus Logs
  getFocusLogs(): FocusLog[] {
    return getLocalItem<FocusLog[]>(STORAGE_KEYS.FOCUS_LOGS, []);
  },
  addFocusLog(log: Omit<FocusLog, 'id'>): FocusLog {
    const logs = this.getFocusLogs();
    const newLog: FocusLog = {
      ...log,
      id: `flog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    logs.unshift(newLog);
    setLocalItem(STORAGE_KEYS.FOCUS_LOGS, logs);
    return newLog;
  },

  // Reflections (Check-ins)
  getReflections(): FocusReflection[] {
    return getLocalItem<FocusReflection[]>(STORAGE_KEYS.REFLECTIONS, INITIAL_REFLECTIONS);
  },
  addReflection(reflection: Omit<FocusReflection, 'id' | 'timestamp'>): FocusReflection {
    const reflections = this.getReflections();
    const newRef: FocusReflection = {
      ...reflection,
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    reflections.unshift(newRef);
    setLocalItem(STORAGE_KEYS.REFLECTIONS, reflections);
    return newRef;
  },
  clearReflections(): void {
    setLocalItem(STORAGE_KEYS.REFLECTIONS, []);
  },

  // Uploaded Materials
  getMaterials(): UploadedMaterial[] {
    return getLocalItem<UploadedMaterial[]>(STORAGE_KEYS.MATERIALS, [
      {
        id: 'mat_cs201',
        fileName: 'CS201_Syllabus_Fall2026.pdf',
        fileType: 'pdf',
        fileSize: 245000,
        uploadedAt: '2026-11-05T10:00:00Z',
        status: 'extracted',
        courseGuess: 'CS 201',
        extractedTasksCount: 3,
        rawExcerpt: 'CS 201: Data Structures and Algorithms - Fall 2026...',
      },
      {
        id: 'mat_bio110',
        fileName: 'BIO110_LabManual_Exp4.pdf',
        fileType: 'pdf',
        fileSize: 184000,
        uploadedAt: '2026-11-07T12:00:00Z',
        status: 'extracted',
        courseGuess: 'BIO 110',
        extractedTasksCount: 2,
        rawExcerpt: 'BIO 110 Lab 4 formal write-up due Tuesday Nov 18...',
      },
    ]);
  },
  addMaterial(material: UploadedMaterial): void {
    const list = this.getMaterials();
    list.unshift(material);
    setLocalItem(STORAGE_KEYS.MATERIALS, list);
  },
  deleteMaterial(materialId: string): void {
    const list = this.getMaterials().filter((m) => m.id !== materialId);
    setLocalItem(STORAGE_KEYS.MATERIALS, list);
  },

  // Active Focus Timer State (for refresh and cross-page persistence)
  getActiveFocus() {
    return getLocalItem<{
      sessionId?: string;
      taskId?: string;
      taskTitle?: string;
      courseName?: string;
      courseColor?: string;
      mode: 'pomodoro' | 'stopwatch' | 'custom';
      durationMinutes: number;
      remainingSeconds: number;
      isRunning: boolean;
      sessionGoal?: string;
      startedAt?: string;
      isBreak: boolean;
    } | null>(STORAGE_KEYS.ACTIVE_FOCUS, null);
  },
  saveActiveFocus(state: any): void {
    setLocalItem(STORAGE_KEYS.ACTIVE_FOCUS, state);
  },
  clearActiveFocus(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_FOCUS);
      notifyChange();
    }
  },

  // Reset to initial sample data
  resetToSampleData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(INITIAL_SCHEDULE));
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(INITIAL_REFLECTIONS));
    localStorage.removeItem(STORAGE_KEYS.FOCUS_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_FOCUS);
    notifyChange();
  },

  // Clear all data (privacy compliance)
  clearAllUserData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    notifyChange();
  },
};

