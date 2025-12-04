'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STUDENT' | 'ADMIN';
  allowedRoles?: Array<'STUDENT' | 'ADMIN'>;
}

export default function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/dashboard');
      } else if (allowedRoles && !allowedRoles.includes(user.role as 'STUDENT' | 'ADMIN')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, requiredRole, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole) || (allowedRoles && !allowedRoles.includes(user.role as 'STUDENT' | 'ADMIN'))) {
    return null;
  }

  return <>{children}</>;
}

