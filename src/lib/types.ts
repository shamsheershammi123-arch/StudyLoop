export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type TimeOfDayPreference = 'morning' | 'afternoon' | 'evening' | 'flexible';

export interface DayAvailability {
  day: DayOfWeek;
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "21:00"
  targetDailyHours: number; // e.g., 3 hours
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  timezone: string;
  preferredSessionLength: number; // in minutes (default 25 or 45)
  preferredBreakLength: number;   // in minutes (default 5 or 10)
  weeklyAvailability: DayAvailability[];
  preferredTimeOfDay: TimeOfDayPreference;
  maxDailySessions: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  instructor?: string;
  notes?: string;
  targetGrade?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string; // ISO date YYYY-MM-DD
  estimatedHours: number;
  priority: TaskPriority;
  status: TaskStatus;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  sourceExcerpt?: string;
  pageReference?: string;
  needsReview?: boolean;
  reviewReason?: string;
  priorityRationale?: string;
  requiredMaterials?: string[];
  instructions?: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'missed';

export interface StudySession {
  id: string;
  taskId: string;
  taskTitle: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  durationMinutes: number;
  status: SessionStatus;
  priorityRationale: string;
  sessionObjective?: string;
  completedAt?: string;
  actualMinutes?: number;
  reflectionId?: string;
  isRecovered?: boolean;
}

export type FocusModeType = 'pomodoro' | 'stopwatch' | 'custom';

export interface FocusLog {
  id: string;
  sessionId?: string;
  taskId?: string;
  taskTitle?: string;
  courseId?: string;
  courseName?: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  targetMinutes: number;
  mode: FocusModeType;
  completedFully: boolean;
  reflectionId?: string;
  notes?: string;
}

export type FocusFactor =
  | 'deep_flow'
  | 'notifications'
  | 'fatigue'
  | 'task_too_large'
  | 'unsure_next_step'
  | 'unexpected_interruption'
  | 'environment_noise'
  | 'other';

export interface FocusReflection {
  id: string;
  focusLogId?: string;
  sessionId?: string;
  taskId?: string;
  taskTitle?: string;
  courseName?: string;
  timestamp: string;
  energyLevel: number; // 1-5
  factor: FocusFactor;
  notes?: string;
  aiSuggestedAdjustment?: string;
}

export interface UploadedMaterial {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'text';
  fileSize: number;
  uploadedAt: string;
  status: 'processing' | 'extracted' | 'error';
  courseGuess?: string;
  extractedTasksCount: number;
  rawExcerpt?: string;
  error?: string;
}

export interface ExtractedCandidateTask {
  title: string;
  course: string;
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  priority: TaskPriority;
  requiredMaterials?: string[];
  instructions?: string;
  sourceExcerpt?: string;
  pageReference?: string;
  needsReview: boolean;
  reviewReason?: string;
  selected?: boolean; // For user selection in review UI
}

export interface SessionDiffItem {
  sessionId: string;
  taskTitle: string;
  courseName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  reason: string;
}

export interface RecoveryDiff {
  id: string;
  generatedAt: string;
  triggerReason: string; // "Session missed on Nov 14 at 10:00 AM"
  supportiveMessage: string;
  affectedSessions: SessionDiffItem[];
  proposedSessions: StudySession[];
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CoachInsight {
  id: string;
  category: 'fatigue' | 'session_length' | 'pacing' | 'time_of_day' | 'break_pattern';
  headline: string;
  observation: string;
  suggestedAction: string;
  actionType: 'shorten_session' | 'add_break' | 'shift_time' | 'break_down_task';
  applied: boolean;
}

