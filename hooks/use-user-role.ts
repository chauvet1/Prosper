"use client";

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useEffect, useState } from 'react';
import { convexWorkOS } from '@/lib/convex-workos';

export function useUserRole() {
  const { user, loading } = useAuth();
  const [convexUser, setConvexUser] = useState<any>(null);
  const [convexLoading, setConvexLoading] = useState(false);

  console.log('useUserRole - WorkOS auth state:', { user: user?.email, loading, userId: user?.id });

  const isAuthenticated = !!user
  const isLoading = loading || convexLoading

  // Fetch user data from Convex when WorkOS user changes
  useEffect(() => {
    if (user?.id) {
      setConvexLoading(true);
      console.log('Fetching user data for:', user.id, user.email);
      
      // Try to get user by WorkOS ID first
      convexWorkOS.getUserByWorkosId(user.id)
        .then((workosUser) => {
          console.log('WorkOS user found:', workosUser);
          if (workosUser) {
            setConvexUser(workosUser);
            return null; // Don't continue to email lookup
          } else if (user.email) {
            // Fallback to email lookup if WorkOS ID not found
            console.log('WorkOS user not found, trying email lookup:', user.email);
            return convexWorkOS.getUserByEmail(user.email);
          }
          return null;
        })
        .then((emailUser) => {
          if (emailUser && !convexUser) {
            console.log('Email user found:', emailUser);
            setConvexUser(emailUser);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        })
        .finally(() => {
          console.log('Finished fetching user data');
          setConvexLoading(false);
        });
    } else {
      console.log('No user ID, clearing Convex user');
      setConvexUser(null);
    }
  }, [user?.id, user?.email]);

  // Determine user role based on Convex user data or email domain
  const getUserRole = () => {
    if (!user || !isAuthenticated) {
      console.log('No user or not authenticated');
      return null;
    }

    console.log('Getting user role for:', user.email, 'Convex user:', convexUser);

    // First check Convex user role
    if (convexUser?.role) {
      console.log('Using Convex role:', convexUser.role);
      return convexUser.role;
    }

    // Fallback to email domain check
    const email = user.email?.toLowerCase() || '';
    console.log('Checking email domain:', email);
    if (email.includes('admin') || email.includes('prosper') || email.includes('mouil')) {
      console.log('Email domain indicates admin');
      return 'admin';
    }
    
    // Default to client for any other authenticated user
    console.log('Defaulting to client role');
    return 'client';
  };

  const role = getUserRole();
  const isAdmin = role === 'admin';
  const isClient = role === 'client';

  console.log('User role state:', { role, isAdmin, isClient, isAuthenticated, isLoading, convexUser });

  return {
    user,
    isAuthenticated,
    isLoading,
    role,
    isAdmin,
    isClient,
    convexUser,
    workosUser: user,
  };
}
