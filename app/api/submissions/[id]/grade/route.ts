import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { gradeSubmissionSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const validatedData = gradeSubmissionSchema.parse(body);

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        grade: validatedData.grade,
        feedback: validatedData.feedback,
        status: 'GRADED',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    logger.security('Submission graded by admin', {
      submissionId: id,
      studentId: submission.studentId,
      assignmentId: submission.assignmentId,
      grade: validatedData.grade,
    });

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      logger.error('Grade validation error', { errors: error.issues });
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Grade submission error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

