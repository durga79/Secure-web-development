import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, isAuthenticated } from '@/lib/session';
import { assignmentSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await isAuthenticated();
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // If admin and no courseId, return all assignments
    if (!courseId && sessionData.role === 'ADMIN') {
      const assignments = await prisma.assignment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });
      return NextResponse.json({ assignments });
    }

    // For students or when courseId is specified
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    if (sessionData.role === 'STUDENT') {
      const isEnrolled = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: sessionData.userId!,
            courseId,
          },
        },
      });

      if (!isEnrolled) {
        return NextResponse.json(
          { error: 'Not enrolled in this course' },
          { status: 403 }
        );
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    logger.error('Get assignments error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = assignmentSchema.parse(body);

    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: validatedData.courseId,
        title: validatedData.title,
        description: validatedData.description,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        fileUrl: validatedData.fileUrl || null,
        fileName: validatedData.fileName || null,
      },
      include: {
        course: true,
      },
    });

    logger.security('Assignment created', {
      assignmentId: assignment.id,
      courseId: assignment.courseId,
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      logger.error('Assignment validation error', { errors: error.issues });
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Create assignment error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

