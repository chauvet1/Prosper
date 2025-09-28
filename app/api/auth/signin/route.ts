import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user with WorkOS
    const { user, accessToken, refreshToken } = await workos.userManagement.authenticateWithPassword({
      email,
      password,
      clientId: process.env.WORKOS_CLIENT_ID!,
      organizationId: process.env.WORKOS_ORGANIZATION_ID!,
    });

    // Sync user with Convex database
    try {
      await convex.mutation(api.workos.upsertUser, {
        workosId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
        emailVerified: user.emailVerified,
      });
    } catch (syncError) {
      console.error('Failed to sync user with Convex:', syncError);
      // Continue with authentication even if sync fails
    }

    // Create session (you might want to use iron-session or similar)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
    });

    // Set secure HTTP-only cookies for tokens
    response.cookies.set('workos-access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (refreshToken) {
      response.cookies.set('workos-refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Authentication failed',
        code: error.code || 'AUTH_ERROR'
      },
      { status: 401 }
    );
  }
}
