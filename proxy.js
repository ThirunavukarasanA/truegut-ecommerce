import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req) {
     const { pathname } = req.nextUrl;

     // Public routes that don't require authentication
     const publicRoutes = ['/admin', '/admin/forgot-password', '/admin/reset-password'];

     // Check if the current path is a public route
     const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

     // 1. Redirect to dashboard if trying to access login page while logged in
     if (pathname === '/admin') {
          const token = req.cookies.get('admin_token')?.value;
          if (token) {
               try {
                    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
                    await jwtVerify(token, secret);
                    // Valid token? Redirect to dashboard
                    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
               } catch (e) {
                    // Invalid token? Stay on login page
               }
          }
          // No token? Allowed to stay on login page
          return NextResponse.next();
     }

     // 2. Allow public routes without authentication
     if (isPublicRoute) {
          return NextResponse.next();
     }

     // 3. Protect all other /admin/* routes
     const token = req.cookies.get('admin_token')?.value;

     if (!token) {
          // No token? Redirect to login
          return NextResponse.redirect(new URL('/admin', req.url));
     }

     try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          await jwtVerify(token, secret);
          return NextResponse.next();
     } catch (error) {
          // Invalid token? Redirect to login
          return NextResponse.redirect(new URL('/admin', req.url));
     }
}

export const config = {
     // Match all paths starting with /admin
     matcher: '/admin/:path*',
};
