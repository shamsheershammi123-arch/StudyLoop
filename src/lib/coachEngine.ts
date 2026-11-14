import { CoachInsight, FocusFactor, FocusReflection } from './types';

export interface PatternAnalysis {
  totalReflections: number;
  averageEnergy: number;
  topFactor: FocusFactor | null;
  factorCounts: Record<FocusFactor, number>;
  insights: CoachInsight[];
}

export function analyzeFocusPatterns(reflections: FocusReflection[]): PatternAnalysis {
  if (!reflections || reflections.length === 0) {
    return {
      totalReflections: 0,
      averageEnergy: 3.5,
      topFactor: null,
      factorCounts: {
        deep_flow: 0,
        notifications: 0,
        fatigue: 0,
        task_too_large: 0,
        unsure_next_step: 0,
        unexpected_interruption: 0,
        environment_noise: 0,
        other: 0,
      },
      insights: [
        {
          id: 'insight_welcome',
          category: 'session_length',
          headline: 'Start with 25-45 minute sessions',
          observation: 'As you complete study sessions and check in, StudyLoop will identify your natural energy patterns.',
          suggestedAction: 'Keep an eye on how you feel after your next 3 sessions.',
          actionType: 'shorten_session',
          applied: false,
        },
      ],
    };
  }

  const factorCounts: Record<FocusFactor, number> = {
    deep_flow: 0,
    notifications: 0,
    fatigue: 0,
    task_too_large: 0,
    unsure_next_step: 0,
    unexpected_interruption: 0,
    environment_noise: 0,
    other: 0,
  };

  let totalEnergy = 0;
  for (const r of reflections) {
    if (factorCounts[r.factor] !== undefined) {
      factorCounts[r.factor]++;
    } else {
      factorCounts.other++;
    }
    totalEnergy += r.energyLevel || 3;
  }

  const averageEnergy = Math.round((totalEnergy / reflections.length) * 10) / 10;

  // Find top factor
  let maxCount = 0;
  let topFactor: FocusFactor | null = null;
  for (const [factor, count] of Object.entries(factorCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topFactor = factor as FocusFactor;
    }
  }

  const insights: CoachInsight[] = [];

  // 1. Fatigue pattern
  if (factorCounts.fatigue >= 2 || (topFactor === 'fatigue' && reflections.length >= 2)) {
    insights.push({
      id: 'insight_fatigue',
      category: 'fatigue',
      headline: 'Fatigue detected across sessions',
      observation: `${factorCounts.fatigue} of your recent check-ins flagged fatigue as the main friction point.`,
      suggestedAction: 'Try shortening your target focus blocks from 45 min down to 25 or 30 min with a 5-min walk between sessions.',
      actionType: 'shorten_session',
      applied: false,
    });
  }

  // 2. Task felt too large
  if (factorCounts.task_too_large >= 1 || topFactor === 'task_too_large') {
    insights.push({
      id: 'insight_breakdown',
      category: 'pacing',
      headline: 'Task sizing may be causing cognitive drag',
      observation: 'When tasks feel broad, starting and maintaining momentum takes extra mental energy.',
      suggestedAction: 'Divide large milestones into 20-minute concrete micro-steps before opening your books.',
      actionType: 'break_down_task',
      applied: false,
    });
  }

  // 3. Notifications / Interruption
  if (factorCounts.notifications >= 1 || factorCounts.unexpected_interruption >= 2) {
    insights.push({
      id: 'insight_friction',
      category: 'break_pattern',
      headline: 'External distractions interrupting flow',
      observation: `${factorCounts.notifications + factorCounts.unexpected_interruption} sessions were impacted by notifications or outside disruptions.`,
      suggestedAction: 'Turn on Fullscreen Mode and enable ambient background noise in StudyLoop during focus sessions.',
      actionType: 'shift_time',
      applied: false,
    });
  }

  // 4. Strong deep flow
  if (factorCounts.deep_flow >= 2) {
    insights.push({
      id: 'insight_flow',
      category: 'time_of_day',
      headline: 'Solid rhythm on analytical tasks',
      observation: `You logged ${factorCounts.deep_flow} sessions in deep flow! Your current session length fits your mental endurance.`,
      suggestedAction: 'Schedule your toughest problem sets during these proven high-energy windows.',
      actionType: 'shift_time',
      applied: false,
    });
  }

  return {
    totalReflections: reflections.length,
    averageEnergy,
    topFactor,
    factorCounts,
    insights,
  };
}

