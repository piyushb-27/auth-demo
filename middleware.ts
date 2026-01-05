import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (token && (await verifyToken(token))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect root to login
  if (pathname === '/') {
    if (token && (await verifyToken(token))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
};
