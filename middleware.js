// middleware.js
import { NextResponse } from 'next/server';

// Edge-side cookie reader. Cookies are URL-encoded JSON; decode then parse,
// returning null on any failure so middleware never throws.
function readJsonCookie(request, name) {
  const raw = request.cookies.get(name)?.value;
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

// Resolve role from cookies. Prefers the new `user` cookie; falls back to the
// legacy `dietician` cookie which has no role and defaults to 'trainer'.
function readRole(request) {
  const user = readJsonCookie(request, 'user');
  if (user?.role) return user.role;
  const legacy = readJsonCookie(request, 'dietician');
  if (legacy) return 'trainer';
  return null;
}

// Where a logged-in user with a given role belongs. Mirrors landingPathForUser
// in src/lib/user.js but inlined here because middleware can't import client lib.
function homeForRole(role) {
  switch (role) {
    case 'super_admin':   return '/super-admin/overview';
    case 'trainer_admin': return '/trainer-admin/overview';
    case 'trainer':       return '/trainer/dashboard';
    default:              return '/trainer/dashboard';
  }
}

export function middleware(request) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/trainer') ||
    pathname.startsWith('/trainer-admin') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/superadmin-trainer');

  // 🔒 Not logged in and visiting protected route → send to login.
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 🛡️ Role-aware guards.
  if (token) {
    const role = readRole(request);

    if (pathname.startsWith('/super-admin') && role !== 'super_admin') {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    if (pathname.startsWith('/superadmin-trainer') && role !== 'super_admin') {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    // /trainer-admin/invites is also open to super_admin (and the `admin`
    // alias) — being a super admin / admin you can invite trainers too.
    // Every other /trainer-admin/* route stays trainer_admin-only.
    if (pathname.startsWith('/trainer-admin/invites')) {
      const inviteRoles = ['trainer_admin', 'admin', 'super_admin'];
      if (!inviteRoles.includes(role)) {
        return NextResponse.redirect(new URL(homeForRole(role), request.url));
      }
    } else if (pathname.startsWith('/trainer-admin') && role !== 'trainer_admin') {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    // /trainer/ (with trailing slash) so we don't accidentally match /trainer-admin.
    if (pathname.startsWith('/trainer/') && role !== 'trainer') {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
  }

  // Allow accept-invite and signup through even if logged in
  if (pathname === '/accept-invite' || pathname === '/signup') {
    return NextResponse.next();
  }

  // 🔓 Logged in and visiting public auth page → bounce to role-appropriate home.
  const authPages = ['/', '/login', '/register'];
  if (authPages.includes(pathname) && token) {
    const role = readRole(request);
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/accept-invite',
    '/signup',
    '/trainer/:path*',
    '/trainer-admin/:path*',
    '/super-admin/:path*',
    '/superadmin-trainer/:path*',
  ],
};
