import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { enrollmentSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = enrollmentSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can be enrolled in courses' },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

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
        { error: 'Student already enrolled in this course' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: true,
      },
    });

    logger.security('Student enrolled in course', {
      userId: validatedData.userId,
      courseId: validatedData.courseId,
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
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Enroll student error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      );
    }

    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    logger.security('Student unenrolled from course', { userId, courseId });

    return NextResponse.json({ message: 'Enrollment removed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Unenroll student error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

