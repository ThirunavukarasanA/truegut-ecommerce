import { NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from './lib/admin/auth-helpers';

export default async function proxy(request) {
     const path = request.nextUrl.pathname;

     // Public paths (Matcher handles the prefix, so we only check specific sub-paths if needed)
     // Since matcher restricts to /admin and /api/admin, we verify specific overrides
     // Note: /admin/login is public. /admin might be public (login page).
     const isPublicPath = path === '/admin' || path === '/admin/login';

     const accessToken = request.cookies.get('admin_access_token')?.value;
     const refreshToken = request.cookies.get('admin_refresh_token')?.value;

     // 1. Verify Access Token
     if (accessToken) {
          const payload = await verifyToken(accessToken);
          if (payload) {
               // If user is already on login page and authenticated, redirect to dashboard
               if (path === '/admin' || path === '/admin/login') {
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
               }
               return NextResponse.next();
          }
     }

     // 2. If Access Token invalid/missing, try Refresh Token
     if (refreshToken) {
          const payload = await verifyToken(refreshToken);

          if (payload) {
               // Refresh Token is valid! Issue new Access Token
               const newAccessToken = await signAccessToken({
                    sub: payload.sub,
                    role: payload.role,
                    email: payload.email
               });

               // If user is on login page, redirect to dashboard
               if (path === '/admin' || path === '/admin/login') {
                    const response = NextResponse.redirect(new URL('/admin/dashboard', request.url));
                    response.cookies.set({
                         name: 'admin_access_token',
                         value: newAccessToken,
                         httpOnly: true,
                         path: '/',
                         secure: process.env.NODE_ENV === 'production',
                         maxAge: 15 * 60, // 15 minutes
                         sameSite: 'lax',
                    });
                    return response;
               }

               // Update request cookies for downstream access in this same request
               const requestHeaders = new Headers(request.headers);
               requestHeaders.set('x-admin-new-token', newAccessToken);

               // Create response with new cookie
               const response = NextResponse.next({
                    request: {
                         headers: requestHeaders,
                    },
               });

               response.cookies.set({
                    name: 'admin_access_token',
                    value: newAccessToken,
                    httpOnly: true,
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 15 * 60, // 15 minutes
                    sameSite: 'lax',
               });

               return response;
          }
     }

     // 3. If both invalid/missing
     if (!isPublicPath) {
          if (path.startsWith('/api/')) {
               return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
          }
          return NextResponse.redirect(new URL('/admin', request.url));
     }

     return NextResponse.next();
}

export const config = {
     matcher: [
          '/admin/:path*',
          '/api/admin/:path*'
     ],
};
