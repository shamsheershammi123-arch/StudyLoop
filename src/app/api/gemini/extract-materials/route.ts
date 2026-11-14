import { NextRequest, NextResponse } from 'next/server';
import { extractTasksFromMaterialAI } from '@/lib/gemini';
import { z } from 'zod';

const ExtractRequestSchema = z.object({
  text: z.string().min(10, 'Document text must contain at least 10 characters'),
  fileName: z.string().optional().default('Syllabus.pdf'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExtractRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { text, fileName } = parsed.data;
    const result = await extractTasksFromMaterialAI(text, fileName);

    return NextResponse.json({
      success: true,
      tasks: result.tasks,
      courseGuess: result.courseGuess,
      usedAI: result.usedAI,
      rawExcerpt: result.rawExcerpt,
    });
  } catch (error: any) {
    console.error('API Error in extract-materials:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process document' },
      { status: 500 }
    );
  }
}

