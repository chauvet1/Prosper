"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { syncUserWithConvex } from '@/lib/workos-sync';

export default function CallbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Sync user data with Convex
      syncUserWithConvex(user).then(() => {
        // Redirect to home page, which will handle role-based redirect
        router.push('/');
      });
    } else if (!loading && !user) {
      // No user, redirect to home
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
