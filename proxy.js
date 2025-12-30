import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req) {
     const { pathname } = req.nextUrl;

     // 1. Redirect to dashboard if trying to access public login page while logged in
     if (pathname === '/admin') {
          const token = req.cookies.get('admin_token')?.value;
          if (token) {
               try {
                    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
                    await jwtVerify(token, secret);
                    // Valid token? Redirect to dashboard
                    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
               } catch (e) {
                    // Invalid token? Stay on login page (no action needed)
               }
          }
          // No token? Allowed to stay on login page
          return NextResponse.next();
     }

     // 2. Protect all other /admin/* routes
     // The matcher ensures this only runs on /admin/* paths.
     // Since we handled /admin above, everything else here requires auth.

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
