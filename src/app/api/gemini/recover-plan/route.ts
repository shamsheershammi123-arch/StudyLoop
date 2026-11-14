import { NextRequest, NextResponse } from 'next/server';
import { recoverPlanWithAI } from '@/lib/gemini';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { missedSession, allSessions, tasks, userProfile, reason } = body;

    if (!missedSession || !Array.isArray(allSessions) || !userProfile) {
      return NextResponse.json(
        { error: 'Missing required parameters: missedSession, allSessions, and userProfile' },
        { status: 400 }
      );
    }

    const recoveryDiff = await recoverPlanWithAI(
      missedSession,
      allSessions,
      tasks || [],
      userProfile,
      reason || 'Session missed or rescheduled'
    );

    return NextResponse.json({
      success: true,
      recoveryDiff,
    });
  } catch (error: any) {
    console.error('API Error in recover-plan:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate recovery plan' },
      { status: 500 }
    );
  }
}

