import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, isAuthenticated } from '@/lib/session';
import { courseSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const sessionData = await isAuthenticated();

    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    logger.error('Get courses error', { error: String(error) });
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
    const validatedData = courseSchema.parse(body);

    const existingCourse = await prisma.course.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: validatedData,
    });

    logger.security('Course created', { courseId: course.id, code: course.code });

    return NextResponse.json({ course }, { status: 201 });
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

    logger.error('Create course error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

