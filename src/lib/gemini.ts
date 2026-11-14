import { GoogleGenAI } from '@google/genai';
import { ExtractedCandidateTask, RecoveryDiff, StudySession, Task, UserProfile, FocusReflection } from './types';
import { createPlanRecovery } from './recoveryEngine';

// Get server-side Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * 1. Material Extraction Agent:
 * Extracts candidate course, tasks, deadlines, effort estimates, and source excerpts from uploaded material
 */
export async function extractTasksFromMaterialAI(
  textContent: string,
  fileName: string
): Promise<{ tasks: ExtractedCandidateTask[]; courseGuess: string; usedAI: boolean; rawExcerpt: string }> {
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `You are the StudyLoop Academic Material Parser.
Extract all upcoming assignments, exams, quizzes, lab reports, and milestones from this academic document.
Document Title/Filename: ${fileName}

DOCUMENT CONTENT:
"""
${textContent.slice(0, 8000)}
"""

REQUIREMENTS:
1. Identify the Course/Subject name or code (e.g. "CS 201", "BIO 110").
2. Extract candidate tasks with:
   - title: Clear, actionable title including topic if known.
   - course: Course name or code.
   - dueDate: ISO format YYYY-MM-DD. If only relative or day is mentioned, assume current academic semester (Nov 2026). If year is missing, use 2026.
   - estimatedHours: Realistic study hours needed (e.g. 2.0 to 8.0).
   - priority: "high", "medium", or "low" based on deadline proximity and academic weight.
   - requiredMaterials: Array of referenced textbooks, slides, calculators, or tools.
   - instructions: Short summary of key guidelines, submission instructions, or rubric.
   - sourceExcerpt: The EXACT quote from the text where this date/task is mentioned.
   - pageReference: Mentioned section or page (e.g. "Page 3", "Schedule Table", "Section 4").
   - needsReview: true if date, time, or requirement was ambiguous; false otherwise.
   - reviewReason: Why it needs student confirmation if uncertain.

Respond ONLY with valid JSON following this schema:
{
  "courseGuess": "string",
  "tasks": [
    {
      "title": "string",
      "course": "string",
      "dueDate": "YYYY-MM-DD",
      "estimatedHours": 3.5,
      "priority": "high",
      "requiredMaterials": ["string"],
      "instructions": "string",
      "sourceExcerpt": "string",
      "pageReference": "string",
      "needsReview": false,
      "reviewReason": "string"
    }
  ]
}`;

      let outputText: string | null | undefined = null;
      try {
        const response = await client.interactions.create({
          model: 'gemini-3.8-flash',
          input: prompt,
        });
        outputText = response.output_text;
      } catch (interactionErr) {
        console.warn('Interactions API not available, trying client.models.generateContent:', interactionErr);
        try {
          const response = await (client as any).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          outputText = response.text || null;
        } catch (genContentErr) {
          console.warn('generateContent error:', genContentErr);
        }
      }
      if (outputText) {
        // Strip markdown code fences if present
        const cleaned = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          const validatedTasks: ExtractedCandidateTask[] = parsed.tasks.map((t: any) => ({
            title: String(t.title || 'Untitled Academic Task'),
            course: String(t.course || parsed.courseGuess || 'General'),
            dueDate: sanitizeDueDate(t.dueDate),
            estimatedHours: Number(t.estimatedHours) || 3.0,
            priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
            requiredMaterials: Array.isArray(t.requiredMaterials) ? t.requiredMaterials : [],
            instructions: t.instructions || '',
            sourceExcerpt: t.sourceExcerpt || '',
            pageReference: t.pageReference || 'Document',
            needsReview: Boolean(t.needsReview),
            reviewReason: t.reviewReason || (t.needsReview ? 'Please verify deadline' : ''),
            selected: true,
          }));

          return {
            tasks: validatedTasks,
            courseGuess: parsed.courseGuess || 'Course Material',
            usedAI: true,
            rawExcerpt: textContent.slice(0, 300) + '...',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini extraction error, falling back to deterministic parser:', err);
    }
  }

  // Deterministic Heuristic Fallback Parser
  return fallbackExtractTasks(textContent, fileName);
}

function sanitizeDueDate(dateStr?: string): string {
  if (!dateStr) return '2026-11-25';
  const isoMatch = dateStr.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  return '2026-11-25';
}

/**
 * Deterministic Heuristic Parser for offline testing and resilience
 */
function fallbackExtractTasks(
  text: string,
  fileName: string
): { tasks: ExtractedCandidateTask[]; courseGuess: string; usedAI: boolean; rawExcerpt: string } {
  const lines = text.split('\n');
  const tasks: ExtractedCandidateTask[] = [];

  // Guess course name from title / filename
  let courseGuess = 'Course Material';
  const courseMatch =
    fileName.match(/([A-Z]{2,4}\s*\d{3})/i) ||
    text.match(/([A-Z]{2,4}\s*\d{3})/i) ||
    text.match(/(CS\s*\d+|BIO\s*\d+|MATH\s*\d+|ENG\s*\d+|CHEM\s*\d+|PSYC\s*\d+)/i);

  if (courseMatch) {
    courseGuess = courseMatch[0].toUpperCase();
  }

  // Scan text for task and date patterns
  const assignmentKeywords = [
    'assignment',
    'homework',
    'midterm',
    'final exam',
    'exam',
    'quiz',
    'lab report',
    'project',
    'paper',
    'problem set',
  ];

  let currentBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lower = line.toLowerCase();
    const hasKeyword = assignmentKeywords.some((k) => lower.includes(k));

    if (hasKeyword) {
      // Look forward a few lines for dates
      const contextLines = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).map((l) => l.trim());
      const contextText = contextLines.join(' ');

      // Check for month/day
      const dateMatch =
        contextText.match(/(?:due|date|on|deadline)?[:\s]*(nov(?:ember)?|dec(?:ember)?|oct(?:ober)?)\s*(\d{1,2})(?:[,\s]*(\d{4}))?/i) ||
        contextText.match(/(\d{4}-\d{2}-\d{2})/);

      let foundDate = '2026-11-22';
      let pageRef = 'Page 1';
      const pageMatch = contextText.match(/p(?:age|\.)\s*(\d+)/i);
      if (pageMatch) {
        pageRef = `Page ${pageMatch[1]}`;
      }

      if (dateMatch) {
        if (dateMatch[1] && dateMatch[2]) {
          const monthMap: Record<string, string> = {
            oct: '10',
            october: '10',
            nov: '11',
            november: '11',
            dec: '12',
            december: '12',
          };
          const month = monthMap[dateMatch[1].toLowerCase()] || '11';
          const day = dateMatch[2].padStart(2, '0');
          const year = dateMatch[3] || '2026';
          foundDate = `${year}-${month}-${day}`;
        } else if (dateMatch[0].includes('-')) {
          foundDate = dateMatch[0];
        }
      }

      // Check effort
      let effort = 3.0;
      const hoursMatch = contextText.match(/(\d+(?:\.\d+)?)\s*(?:hours|hrs)/i);
      if (hoursMatch) {
        effort = parseFloat(hoursMatch[1]);
      } else if (lower.includes('exam') || lower.includes('midterm')) {
        effort = 6.0;
      } else if (lower.includes('quiz')) {
        effort = 2.0;
      }

      // Determine priority
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (lower.includes('exam') || lower.includes('midterm') || lower.includes('final')) {
        priority = 'high';
      } else if (lower.includes('quiz')) {
        priority = 'low';
      }

      tasks.push({
        title: line.replace(/^[0-9\.\-\*\#\s]+/, '').trim(),
        course: courseGuess,
        dueDate: foundDate,
        estimatedHours: effort,
        priority,
        requiredMaterials: lower.includes('exam') ? ['Formula sheet', 'Textbook notes'] : ['Lecture slides'],
        instructions: `Extracted from course schedule: ${line}`,
        sourceExcerpt: contextLines.slice(0, 2).join(' '),
        pageReference: pageRef,
        needsReview: !dateMatch,
        reviewReason: !dateMatch ? 'Due date inferred; please confirm against official calendar' : undefined,
        selected: true,
      });

      i += 2; // Skip next lines to avoid duplicate detections
    }
  }

  // If no assignments detected via regex, create a helpful fallback task for user review
  if (tasks.length === 0) {
    tasks.push({
      title: `${courseGuess} Course Milestone / Reading Review`,
      course: courseGuess,
      dueDate: '2026-11-20',
      estimatedHours: 3.5,
      priority: 'medium',
      requiredMaterials: ['Syllabus', 'Course notes'],
      instructions: 'Review extracted course syllabus topics and set up primary deliverables.',
      sourceExcerpt: text.slice(0, 150),
      pageReference: 'Page 1',
      needsReview: true,
      reviewReason: 'Automated parser could not detect explicit assignment tags; verify details.',
      selected: true,
    });
  }

  return {
    tasks,
    courseGuess,
    usedAI: false,
    rawExcerpt: text.slice(0, 300) + '...',
  };
}

/**
 * 2. Plan Recovery AI Agent:
 * Evaluates missed session, user availability, and produces a compassionate, non-punitive re-balance
 */
export async function recoverPlanWithAI(
  missedSession: StudySession,
  allSessions: StudySession[],
  tasks: Task[],
  userProfile: UserProfile,
  reason: string
): Promise<RecoveryDiff> {
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `You are the StudyLoop Plan Recovery Coach.
A student missed or had to stop a study session.
Missed Session: "${missedSession.taskTitle}" (${missedSession.courseName})
Scheduled on: ${missedSession.scheduledDate} at ${missedSession.startTime}-${missedSession.endTime}
Trigger Reason: ${reason}
Student Preferred Session Length: ${userProfile.preferredSessionLength} mins

Generate a supportive, encouraging, non-judgmental plan recovery message.
Explain how the work can be smoothly distributed into upcoming available days without cramming or guilt.

Respond ONLY with valid JSON:
{
  "supportiveMessage": "string",
  "explanation": "string"
}`;

      let outputText: string | null | undefined = null;
      try {
        const response = await client.interactions.create({
          model: 'gemini-3.8-flash',
          input: prompt,
        });
        outputText = response.output_text;
      } catch (interactionErr) {
        console.warn('Interactions API not available, trying client.models.generateContent:', interactionErr);
        try {
          const response = await (client as any).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          outputText = response.text || null;
        } catch (genContentErr) {
          console.warn('generateContent error:', genContentErr);
        }
      }
      if (outputText) {
        const cleaned = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Run deterministic conflict-free schedule recalculation
        const diff = createPlanRecovery({
          missedSession,
          allSessions,
          tasks,
          userProfile,
          triggerReason: reason,
        });

        if (parsed.supportiveMessage) {
          diff.supportiveMessage = parsed.supportiveMessage;
        }

        return diff;
      }
    } catch (err) {
      console.warn('Gemini recovery error, using deterministic recovery engine:', err);
    }
  }

  // Fallback to deterministic recovery engine
  return createPlanRecovery({
    missedSession,
    allSessions,
    tasks,
    userProfile,
    triggerReason: reason,
  });
}
