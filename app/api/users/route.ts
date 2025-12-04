import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { sanitizeUserForClient, hashPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { createUserSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const users = await prisma.user.findMany({
      where: role ? { role: role as 'STUDENT' | 'ADMIN' } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            enrollments: true,
            submissions: true,
          },
        },
      },
    });

    const sanitizedUsers = users.map((user) => ({
      ...sanitizeUserForClient(user),
      enrollmentCount: user._count.enrollments,
      submissionCount: user._count.submissions,
    }));

    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Get users error', { error: String(error) });
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
    const validatedData = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: validatedData.role || 'STUDENT',
      },
    });

    logger.info('User created by admin', { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    });

    return NextResponse.json(
      { user: sanitizeUserForClient(user) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Create user error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

