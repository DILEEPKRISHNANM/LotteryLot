import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { verifyPassword } from '@/lib/utils/bcrypt';
import { encodeAccessToken, encodeRefreshToken, JWTPayload } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, username, password_hash, role, is_active')
      .eq('username', username)
      .single();

    if (dbError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role as 'admin' | 'client',
    };

    // Generate both tokens
    const accessToken = encodeAccessToken(payload);  // 5 minutes
    const refreshToken = encodeRefreshToken(payload); // 7 days

    // Store refresh token in httpOnly cookie
    await setAuthCookie(refreshToken);

    // Return access token in response body
    return NextResponse.json(
      {
        success: true,
        accessToken: accessToken, // Client will store this
        user: {
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}