import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/session';
import { submissionSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await requireAuth();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (sessionData.role === 'STUDENT') {
      if (assignmentId) {
        const submissions = await prisma.submission.findMany({
          where: {
            assignmentId,
            studentId: sessionData.userId!,
          },
          include: {
            assignment: {
              include: {
                course: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ submissions });
      }

      const submissions = await prisma.submission.findMany({
        where: { studentId: sessionData.userId! },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ submissions });
    }

    const submissions = await prisma.submission.findMany({
      where: assignmentId ? { assignmentId } : undefined,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Get submissions error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
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

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this assignment' },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId: validatedData.assignmentId,
        studentId: sessionData.userId!,
        content: validatedData.content,
        fileUrl: validatedData.fileUrl || null,
        fileName: validatedData.fileName || null,
        status: 'PENDING',
      },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.security('Assignment submitted', {
      submissionId: submission.id,
      assignmentId: submission.assignmentId,
      studentId: submission.studentId,
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      logger.error('Submission validation error', { errors: error.errors });
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
