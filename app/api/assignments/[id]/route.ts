import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, isAuthenticated } from '@/lib/session';
import { assignmentSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await isAuthenticated();
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
        submissions: {
          where:
            sessionData.role === 'STUDENT'
              ? { studentId: sessionData.userId }
              : undefined,
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    if (sessionData.role === 'STUDENT') {
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
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    logger.error('Get assignment error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const validatedData = assignmentSchema.partial().parse(body);

    const dataToUpdate: Record<string, unknown> = {};
    if (validatedData.title) dataToUpdate.title = validatedData.title;
    if (validatedData.description !== undefined)
      dataToUpdate.description = validatedData.description;
    if (validatedData.dueDate !== undefined)
      dataToUpdate.dueDate = validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : null;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: dataToUpdate,
    });

    logger.security('Assignment updated', { assignmentId: assignment.id });

    return NextResponse.json({ assignment });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Update assignment error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    await prisma.assignment.delete({
      where: { id },
    });

    logger.security('Assignment deleted', { assignmentId: id });

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Delete assignment error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

