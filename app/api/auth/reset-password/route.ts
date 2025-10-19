import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Reset password with WorkOS
    await workos.userManagement.resetPassword({
      token,
      password,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    // Handle specific WorkOS errors
    if (error.code === 'invalid_token') {
      return NextResponse.json(
        { 
          error: 'Invalid or expired reset token. Please request a new password reset.',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    if (error.code === 'token_expired') {
      return NextResponse.json(
        { 
          error: 'Reset token has expired. Please request a new password reset.',
          code: 'TOKEN_EXPIRED'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to reset password',
        code: error.code || 'RESET_ERROR'
      },
      { status: 400 }
    );
  }
}
