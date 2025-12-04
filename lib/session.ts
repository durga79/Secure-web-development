import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  email?: string;
  role?: 'STUDENT' | 'ADMIN';
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'student_portal_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<SessionData | null> {
  const session = await getSession();
  if (session.isLoggedIn && session.userId) {
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      isLoggedIn: true,
    };
  }
  return null;
}

export async function requireAuth(): Promise<SessionData> {
  const sessionData = await isAuthenticated();
  if (!sessionData) {
    throw new Error('Unauthorized');
  }
  return sessionData;
}

export async function requireAdmin(): Promise<SessionData> {
  const sessionData = await requireAuth();
  if (sessionData.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return sessionData;
}

