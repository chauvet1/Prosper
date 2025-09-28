"use client";

import { useUserRole } from '@/hooks/use-user-role';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
  redirectTo?: string;
}

export function RoleBasedRedirect({ 
  children, 
  requiredRole, 
  redirectTo 
}: RoleBasedRedirectProps) {
  const { isAuthenticated, isLoading, role } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredRole && role !== requiredRole) {
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'client') {
        router.push('/dashboard');
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, role, requiredRole, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show children if role matches or no role required
  if (!requiredRole || role === requiredRole) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
