import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, isAuthenticated } from '@/lib/session';
import { enrollmentSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await isAuthenticated();
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (sessionData.role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: sessionData.userId! },
        include: {
          course: true,
        },
      });
      return NextResponse.json({ enrollments });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: userId ? { userId } : undefined,
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    logger.error('Get enrollments error', { error: String(error) });
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
    const validatedData = enrollmentSchema.parse(body);

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: validatedData.userId,
          courseId: validatedData.courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: validatedData.userId,
        courseId: validatedData.courseId,
      },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.security('Enrollment created', {
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      logger.error('Enrollment validation error', { errors: error.issues });
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Create enrollment error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


