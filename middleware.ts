import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based routing
  if (pathname.startsWith('/outlet') && session.role !== 'food_outlet') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname.startsWith('/ngo') && session.role !== 'ngo') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
