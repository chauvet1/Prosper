import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send password reset email via WorkOS
    await workos.userManagement.sendPasswordResetEmail({
      email,
      passwordResetUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
      organizationId: 'org_01K694T4BTVPQ1GJEDDW4G291Y',
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Handle specific WorkOS errors
    if (error.code === 'user_not_found') {
      return NextResponse.json(
        { 
          error: 'No account found with this email address.',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to send password reset email',
        code: error.code || 'RESET_ERROR'
      },
      { status: 400 }
    );
  }
}
