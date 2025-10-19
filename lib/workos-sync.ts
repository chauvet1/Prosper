import { convexWorkOS } from './convex-workos';

// WorkOS AuthKit callback handler for syncing user data with Convex
export async function syncUserWithConvex(workosUser: any) {
  if (!workosUser) return null;

  try {
    // Upsert user data to Convex
    const userId = await convexWorkOS.upsertUser({
      workosId: workosUser.id,
      email: workosUser.email,
      firstName: workosUser.firstName,
      lastName: workosUser.lastName,
      profilePictureUrl: workosUser.profilePictureUrl,
      emailVerified: workosUser.emailVerified,
    });

    console.log('User synced with Convex:', userId);
    return userId;
  } catch (error) {
    console.error('Failed to sync user with Convex:', error);
    return null;
  }
}

// Update user role in Convex
export async function updateUserRole(workosId: string, role: 'admin' | 'client') {
  try {
    const userId = await convexWorkOS.updateUserRole(workosId, role);
    console.log('User role updated:', userId);
    return userId;
  } catch (error) {
    console.error('Failed to update user role:', error);
    return null;
  }
}

// Update user preferences in Convex
export async function updateUserPreferences(
  workosId: string, 
  preferences: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  }
) {
  try {
    const userId = await convexWorkOS.updateUserPreferences(workosId, preferences);
    console.log('User preferences updated:', userId);
    return userId;
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    return null;
  }
}
