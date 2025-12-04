import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, sanitizeUserForClient } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      logger.security('Registration attempt with existing email', { email: validatedData.email });
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: 'STUDENT',
      },
    });

    logger.security('New user registered', { userId: user.id, email: user.email });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: sanitizeUserForClient(user),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Registration error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

