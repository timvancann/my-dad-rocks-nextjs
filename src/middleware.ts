import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Get the token and determine authentication status
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!token;

  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath = 
    path.startsWith('/auth') || 
    path.startsWith('/api/auth') ||
    path === '/';

  // Handle unauthenticated access to protected routes
  if (!isAuthenticated && !isPublicPath) {
    // Store the original URL to redirect back after authentication
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url));
  }

  // Redirect already authenticated users trying to access auth pages
  if (isAuthenticated && path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/auth routes - auth operations handled by NextAuth.js
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. public files (fonts, images, etc)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
