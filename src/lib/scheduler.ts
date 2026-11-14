import { DayAvailability, StudySession, Task, UserProfile } from './types';

interface GenerateScheduleOptions {
  userProfile: UserProfile;
  tasks: Task[];
  startDate?: string; // YYYY-MM-DD (defaults to today)
  daysAhead?: number; // default 14 days
  existingSessions?: StudySession[];
}

// Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Convert minutes from midnight to "HH:mm"
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = Math.floor(totalMinutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Format Date to YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get day of week name from Date
export function getDayName(date: Date): DayAvailability['day'] {
  const days: DayAvailability['day'][] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

/**
 * Generate a realistic, conflict-free study schedule based on user availability and tasks
 */
export function generateStudySchedule({
  userProfile,
  tasks,
  startDate,
  daysAhead = 14,
  existingSessions = [],
}: GenerateScheduleOptions): StudySession[] {
  const sessionLength = userProfile.preferredSessionLength || 45;
  const breakLength = userProfile.preferredBreakLength || 10;
  const blockTotal = sessionLength + breakLength;
  const maxDaily = userProfile.maxDailySessions || 4;

  const today = startDate ? new Date(startDate) : new Date();
  today.setHours(0, 0, 0, 0);

  // Filter tasks that need study
  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  // Sort tasks by:
  // 1. Due date urgency (earliest due first)
  // 2. Priority ('high' = 3, 'medium' = 2, 'low' = 1)
  // 3. Remaining effort
  const priorityScore = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return priorityScore[b.priority] - priorityScore[a.priority];
  });

  // Calculate needed sessions for each task
  // 1 session = sessionLength minutes (e.g. 45 min = 0.75 hours)
  const sessionDurationHours = sessionLength / 60;
  const taskSessionsNeeded: { task: Task; remainingSessions: number }[] = sortedTasks.map((task) => {
    const existingForTask = existingSessions.filter(
      (s) => s.taskId === task.id && (s.status === 'completed' || s.status === 'scheduled')
    );
    const existingHours = (existingForTask.length * sessionLength) / 60;
    const neededHours = Math.max(0.5, task.estimatedHours - existingHours);
    const sessions = Math.max(1, Math.round(neededHours / sessionDurationHours));
    return { task, remainingSessions: sessions };
  });

  // Pre-calculate existing busy slots by date
  const busySlotsByDate: Record<string, { start: number; end: number }[]> = {};
  for (const session of existingSessions) {
    if (session.status === 'completed' || session.status === 'scheduled') {
      if (!busySlotsByDate[session.scheduledDate]) {
        busySlotsByDate[session.scheduledDate] = [];
      }
      busySlotsByDate[session.scheduledDate].push({
        start: timeToMinutes(session.startTime),
        end: timeToMinutes(session.endTime) + breakLength,
      });
    }
  }

  const generatedSessions: StudySession[] = [];
  const sessionsScheduledPerDay: Record<string, number> = {};

  // Track sessions allocated per task per day to enforce spaced repetition (max 2 per day for same task)
  const taskSessionsPerDay: Record<string, Record<string, number>> = {};

  // Iterate over calendar days
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dateStr = formatDateISO(currentDate);
    const dayOfWeek = getDayName(currentDate);

    // Find user availability for this day of week
    const dayConfig = userProfile.weeklyAvailability?.find(
      (d) => d.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!dayConfig || !dayConfig.enabled) {
      continue; // Day not enabled for studying
    }

    const dayStartMinutes = timeToMinutes(dayConfig.startTime || '17:00');
    const dayEndMinutes = timeToMinutes(dayConfig.endTime || '21:30');
    const totalAvailableMins = dayEndMinutes - dayStartMinutes;

    if (totalAvailableMins < sessionLength) {
      continue;
    }

    sessionsScheduledPerDay[dateStr] = sessionsScheduledPerDay[dateStr] || 0;
    taskSessionsPerDay[dateStr] = taskSessionsPerDay[dateStr] || {};
    const existingBusy = busySlotsByDate[dateStr] || [];

    // Find free time slots on this day
    let currentSlotStart = dayStartMinutes;

    while (
      currentSlotStart + sessionLength <= dayEndMinutes &&
      sessionsScheduledPerDay[dateStr] < maxDaily
    ) {
      // Check collision with existing sessions
      const slotEnd = currentSlotStart + sessionLength;
      const collision = existingBusy.some(
        (busy) => Math.max(currentSlotStart, busy.start) < Math.min(slotEnd, busy.end)
      );

      if (collision) {
        currentSlotStart += 15; // advance by 15 mins to find opening
        continue;
      }

      // Pick the next best task that:
      // 1) has remaining sessions
      // 2) is due ON or AFTER this day (not already passed)
      // 3) hasn't exceeded 2 sessions on this same day (spaced learning)
      const candidate = taskSessionsNeeded.find((item) => {
        if (item.remainingSessions <= 0) return false;
        const taskDue = new Date(item.task.dueDate);
        taskDue.setHours(23, 59, 59, 999);
        if (currentDate.getTime() > taskDue.getTime()) return false; // Task due before this date!
        const scheduledToday = taskSessionsPerDay[dateStr][item.task.id] || 0;
        return scheduledToday < 2; // Spacing constraint
      });

      if (!candidate) {
        // Fallback: any task with remaining sessions due in future, even if already 2 today
        const fallbackCandidate = taskSessionsNeeded.find((item) => {
          if (item.remainingSessions <= 0) return false;
          const taskDue = new Date(item.task.dueDate);
          taskDue.setHours(23, 59, 59, 999);
          return currentDate.getTime() <= taskDue.getTime();
        });

        if (!fallbackCandidate) break; // All tasks scheduled or past due!
        candidateTarget = fallbackCandidate;
      } else {
        candidateTarget = candidate;
      }

      const task = candidateTarget.task;
      const daysUntilDue = Math.ceil(
        (new Date(task.dueDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let urgencyRationale = '';
      if (daysUntilDue <= 2) {
        urgencyRationale = `Urgent: Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'} (${task.dueDate}).`;
      } else if (task.priority === 'high') {
        urgencyRationale = `High priority milestone; scheduled during peak study block before ${task.dueDate}.`;
      } else {
        urgencyRationale = `Spaced learning block to ensure steady progression before deadline (${task.dueDate}).`;
      }

      const newSession: StudySession = {
        id: `gen_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        taskId: task.id,
        taskTitle: task.title,
        courseId: task.courseId,
        courseName: task.courseName,
        courseColor: getCourseColor(task.courseName),
        scheduledDate: dateStr,
        startTime: minutesToTime(currentSlotStart),
        endTime: minutesToTime(slotEnd),
        durationMinutes: sessionLength,
        status: 'scheduled',
        priorityRationale: urgencyRationale,
        sessionObjective: `Focused work session on ${task.title}. Target: clear 1-2 subtasks.`,
      };

      generatedSessions.push(newSession);
      candidateTarget.remainingSessions -= 1;
      sessionsScheduledPerDay[dateStr] += 1;
      taskSessionsPerDay[dateStr][task.id] = (taskSessionsPerDay[dateStr][task.id] || 0) + 1;

      // Mark slot as busy including break
      existingBusy.push({
        start: currentSlotStart,
        end: slotEnd + breakLength,
      });

      // Advance slot start
      currentSlotStart = slotEnd + breakLength;
    }
  }

  return generatedSessions;
}

let candidateTarget: { task: Task; remainingSessions: number };

function getCourseColor(courseName: string): string {
  if (courseName.includes('CS') || courseName.includes('Code') || courseName.includes('Algorithm')) return '#3b82f6';
  if (courseName.includes('BIO') || courseName.includes('Bio') || courseName.includes('Chem')) return '#10b981';
  if (courseName.includes('MATH') || courseName.includes('Math') || courseName.includes('Linear')) return '#8b5cf6';
  if (courseName.includes('ENG') || courseName.includes('Write') || courseName.includes('Hist')) return '#f59e0b';
  return '#06b6d4'; // Cyan default
}

