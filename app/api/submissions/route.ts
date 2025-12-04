import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';
import { submissionSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const sessionData = await requireAuth();

    if (sessionData.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can submit assignments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = submissionSchema.parse(body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: validatedData.assignmentId },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: sessionData.userId!,
          courseId: assignment.courseId,
        },
      },
    });

    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: validatedData.assignmentId,
          studentId: sessionData.userId!,
        },
      },
    });

    let submission;
    if (existingSubmission) {
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: validatedData.content,
          status: 'SUBMITTED',
          updatedAt: new Date(),
        },
      });

      logger.security('Submission updated', {
        submissionId: submission.id,
        studentId: sessionData.userId,
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId: validatedData.assignmentId,
          studentId: sessionData.userId!,
          content: validatedData.content,
          status: 'SUBMITTED',
        },
      });

      logger.security('Submission created', {
        submissionId: submission.id,
        studentId: sessionData.userId,
      });
    }

    return NextResponse.json({ submission }, { status: existingSubmission ? 200 : 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Create submission error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

