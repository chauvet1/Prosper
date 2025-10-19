import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

    // Clear authentication cookies
    response.cookies.delete('workos-access-token');
    response.cookies.delete('workos-refresh-token');

    return response;
  } catch (error: any) {
    console.error('Sign out error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Sign out failed',
        code: 'SIGNOUT_ERROR'
      },
      { status: 500 }
    );
  }
}
