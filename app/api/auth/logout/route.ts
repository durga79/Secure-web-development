import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    const userId = session.userId;

    session.destroy();

    if (userId) {
      logger.security('User logged out', { userId });
    }

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

