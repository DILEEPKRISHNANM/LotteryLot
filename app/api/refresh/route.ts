import { NextResponse } from 'next/server';
import { decodeRefreshToken, encodeAccessToken } from '@/lib/auth/jwt';
import { getAuthCookie } from '@/lib/auth/cookies';

export async function POST() {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = await getAuthCookie();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }

    // Validate refresh token
    const payload = decodeRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = encodeAccessToken({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    });

    // Return new access token in response (refresh token stays in cookie)
    return NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken, // Client updates this
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}