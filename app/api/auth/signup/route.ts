import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user with WorkOS
    const user = await workos.userManagement.createUser({
      email,
      password,
      firstName,
      lastName,
      emailVerified: false, // User needs to verify email
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
      // Continue with signup even if sync fails
    }

    // Send email verification
    await workos.userManagement.sendVerificationEmail({
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Handle specific WorkOS errors
    if (error.code === 'user_already_exists') {
      return NextResponse.json(
        { 
          error: 'An account with this email already exists. Please sign in instead.',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Account creation failed',
        code: error.code || 'SIGNUP_ERROR'
      },
      { status: 400 }
    );
  }
}
