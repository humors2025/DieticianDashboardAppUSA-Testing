// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/diet-plan') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/planhistory') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/client') ||
    pathname.startsWith('/plansummary') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/testlog-info');

  // 🔒 If NOT logged in and visiting protected route → send to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/', request.url); // your landing/login
    return NextResponse.redirect(loginUrl);
  }

  // 🔓 If logged in and visiting public auth pages → send to dashboard
  const authPages = ['/', '/login', '/register'];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage && token) {
    const homeUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/diet-plan/:path*',
    '/profile/:path*',
    '/planhistory/:path*',
    '/messages/:path*',
    '/client/:path*',
    '/plansummary/:path*',
    '/settings/:path*',
    '/testlog-info/:path*',
  ],
};
