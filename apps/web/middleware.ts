import { auth } from './auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/signin', '/api/auth'];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  if (!isPublic && !req.auth) {
    const signinUrl = new URL('/signin', req.url);
    signinUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
