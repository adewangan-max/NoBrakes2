import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth pages
  if (pathname === '/admin/login' || pathname === '/admin/signup' || pathname === '/signup' || pathname === '/login') {
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
      const role = payload.role as string;

      // Only allow admin and editor to access /admin routes
      if (role === 'admin' || role === 'editor') {
        return NextResponse.next();
      }

      // If not admin/editor, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/signup'],
};
