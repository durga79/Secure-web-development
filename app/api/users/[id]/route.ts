import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { sanitizeUserForClient } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { userUpdateSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: userId } = await params;

    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    logger.info('User updated by admin', { userId: user.id });

    return NextResponse.json({ user: sanitizeUserForClient(user) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Update user error', { error: String(error) });
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
    const { id: userId } = await params;

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info('User deleted by admin', { userId });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Delete user error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

