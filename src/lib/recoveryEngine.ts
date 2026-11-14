import { RecoveryDiff, SessionDiffItem, StudySession, Task, UserProfile } from './types';
import { formatDateISO, getDayName, minutesToTime, timeToMinutes } from './scheduler';

interface PlanRecoveryOptions {
  missedSession?: StudySession;
  missedSessionId?: string;
  allSessions: StudySession[];
  tasks: Task[];
  userProfile: UserProfile;
  triggerReason?: string;
}

const SUPPORTIVE_MESSAGES = [
  "Life happens, and plans exist to serve you—not the other way around. We've smoothed out your upcoming days so you stay comfortably on track without feeling rushed.",
  "No guilt, no stress. Falling behind on one session is completely normal. We found open space in your upcoming schedule to fit this work without eating into your personal time.",
  "Pacing is a marathon, not a sprint. We've re-balanced your workload across your available study windows so all your deadlines remain secure.",
  "You're in control. We reshuffled your remaining study blocks so you don't have to cram. Review the proposed adjustment below.",
];

/**
 * Creates a guilt-free recovery plan when a student misses, skips, or cuts short a session
 */
export function createPlanRecovery({
  missedSession,
  missedSessionId,
  allSessions,
  tasks,
  userProfile,
  triggerReason = 'Session rescheduled to protect your momentum',
}: PlanRecoveryOptions): RecoveryDiff {
  const sessionLength = userProfile.preferredSessionLength || 45;
  const breakLength = userProfile.preferredBreakLength || 10;
  const maxDaily = userProfile.maxDailySessions || 4;

  const targetSession =
    missedSession ||
    allSessions.find((s) => s.id === missedSessionId) ||
    allSessions.find((s) => s.status === 'missed' || s.status === 'skipped');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clone current sessions
  const updatedSessions = allSessions.map((s) => ({ ...s }));
  const affectedSessions: SessionDiffItem[] = [];

  const supportiveMessage =
    SUPPORTIVE_MESSAGES[Math.floor(Math.random() * SUPPORTIVE_MESSAGES.length)];

  if (!targetSession) {
    // If no specific session target, run a global rebalance of any past-due uncompleted sessions
    const nowStr = formatDateISO(today);
    const uncompletedPast = updatedSessions.filter(
      (s) => s.scheduledDate <= nowStr && s.status === 'scheduled'
    );

    if (uncompletedPast.length === 0) {
      return {
        id: `recovery_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        triggerReason: 'Schedule review',
        supportiveMessage: 'Your current study plan is already balanced and up to date!',
        affectedSessions: [],
        proposedSessions: updatedSessions,
        status: 'pending',
      };
    }
  }

  // Identify sessions to reschedule
  const sessionsToMove: StudySession[] = [];
  if (targetSession) {
    sessionsToMove.push(targetSession);
  } else {
    const pastUnfinished = updatedSessions.filter(
      (s) => s.status === 'scheduled' && s.scheduledDate < formatDateISO(today)
    );
    sessionsToMove.push(...pastUnfinished);
  }

  // For each session to reschedule, search for the next available slot starting tomorrow (or later today)
  for (const session of sessionsToMove) {
    const parentTask = tasks.find((t) => t.id === session.taskId);
    const taskDueDate = parentTask?.dueDate ? new Date(parentTask.dueDate) : new Date(today.getTime() + 7 * 86400000);
    taskDueDate.setHours(23, 59, 59, 999);

    let slotFound = false;

    // Search ahead up to 10 days
    for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
      const candidateDate = new Date(today);
      candidateDate.setDate(today.getDate() + dayOffset);

      if (candidateDate.getTime() > taskDueDate.getTime()) {
        // Exceeds task deadline; try to squeeze in before deadline
        break;
      }

      const dateStr = formatDateISO(candidateDate);
      const dayName = getDayName(candidateDate);

      // Check user availability for that day
      const dayConfig = userProfile.weeklyAvailability?.find(
        (d) => d.day.toLowerCase() === dayName.toLowerCase()
      );

      if (!dayConfig || !dayConfig.enabled) continue;

      const dayStartMins = timeToMinutes(dayConfig.startTime || '17:00');
      const dayEndMins = timeToMinutes(dayConfig.endTime || '21:30');

      // Check existing scheduled sessions on that day
      const daySessions = updatedSessions.filter(
        (s) => s.scheduledDate === dateStr && s.status !== 'skipped' && s.status !== 'missed'
      );

      if (daySessions.length >= maxDaily) continue;

      // Find busy time ranges
      const busyTimes = daySessions.map((s) => ({
        start: timeToMinutes(s.startTime),
        end: timeToMinutes(s.endTime) + breakLength,
      }));

      // Find first non-colliding slot
      let testStart = dayStartMins;
      while (testStart + sessionLength <= dayEndMins) {
        const testEnd = testStart + sessionLength;
        const collides = busyTimes.some(
          (b) => Math.max(testStart, b.start) < Math.min(testEnd, b.end)
        );

        if (!collides) {
          // Found opening!
          const oldDate = session.scheduledDate;
          const oldTime = `${session.startTime} - ${session.endTime}`;
          const newDate = dateStr;
          const newTime = `${minutesToTime(testStart)} - ${minutesToTime(testEnd)}`;

          // Update session in updatedSessions
          const sessionIndex = updatedSessions.findIndex((s) => s.id === session.id);
          if (sessionIndex !== -1) {
            updatedSessions[sessionIndex] = {
              ...updatedSessions[sessionIndex],
              scheduledDate: newDate,
              startTime: minutesToTime(testStart),
              endTime: minutesToTime(testEnd),
              status: 'scheduled',
              isRecovered: true,
              priorityRationale: `Recovered session: Reallocated to ${dayName} (${newDate}) without compromising deadline.`,
            };
          }

          affectedSessions.push({
            sessionId: session.id,
            taskTitle: session.taskTitle,
            courseName: session.courseName,
            oldDate,
            oldTime,
            newDate,
            newTime,
            reason: `Shifted to open ${dayName} study window with zero deadline conflicts.`,
          });

          slotFound = true;
          break;
        }

        testStart += 15;
      }

      if (slotFound) break;
    }

    if (!slotFound) {
      // Fallback: place on nearest available day even if requires adjusting daily session count slightly
      const fallbackDate = new Date(today);
      fallbackDate.setDate(today.getDate() + 1);
      const fallbackDateStr = formatDateISO(fallbackDate);

      affectedSessions.push({
        sessionId: session.id,
        taskTitle: session.taskTitle,
        courseName: session.courseName,
        oldDate: session.scheduledDate,
        oldTime: `${session.startTime} - ${session.endTime}`,
        newDate: fallbackDateStr,
        newTime: '19:00 - 19:45',
        reason: 'Placed in tomorrow evening reserve buffer.',
      });

      const sessionIndex = updatedSessions.findIndex((s) => s.id === session.id);
      if (sessionIndex !== -1) {
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          scheduledDate: fallbackDateStr,
          startTime: '19:00',
          endTime: '19:45',
          status: 'scheduled',
          isRecovered: true,
        };
      }
    }
  }

  return {
    id: `recovery_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    triggerReason,
    supportiveMessage,
    affectedSessions,
    proposedSessions: updatedSessions,
    status: 'pending',
  };
}

