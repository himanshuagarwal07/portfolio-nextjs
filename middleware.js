import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Login page itself must stay open (avoid redirect loop)
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (!token || !expected || token !== expected) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
