import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { getSession } from '@/lib/session';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      logger.security('Login attempt with non-existent email', { email: validatedData.email });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);

    if (!isValidPassword) {
      logger.security('Failed login attempt', { userId: user.id, email: user.email });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    logger.security('Successful login', { userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Login error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

