import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'study_auth';
const AUTH_SECRET = process.env.AUTH_SECRET || 'studyos-secret-2024';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;
  const validUser = process.env.BASIC_AUTH_USER || 'admin';
  const validPwd = process.env.BASIC_AUTH_PASSWORD || 'password123';

  if (username === validUser && password === validPwd) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, AUTH_SECRET, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
