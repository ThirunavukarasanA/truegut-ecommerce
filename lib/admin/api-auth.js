import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import dbConnect from '@/lib/admin/db';
import User from '@/models/User';

/**
 * Verifies the admin token and returns the user object.
 * @returns {Promise<User|null>} The authenticated user or null.
 */
export async function getAuthenticatedUser() {
     try {
          const cookieStore = await cookies();
          const headerStore = await headers();

          let token = cookieStore.get('admin_access_token')?.value;

          // Fallback to header if middleware refreshed it just now
          if (!token) {
               token = headerStore.get('x-admin-new-token');
          }

          if (!token) return null;

          const secretKey = process.env.JWT_SECRET || 'default_secret_key';
          const secret = new TextEncoder().encode(secretKey);

          try {
               const { payload } = await jwtVerify(token, secret);

               await dbConnect();
               const user = await User.findById(payload.sub);

               return user;
          } catch (jwtError) {
               return null;
          }
     } catch (error) {
          return null;
     }
}

/**
 * Higher-order helper for protected API routes.
 * @param {Function} handler The API route handler function.
 * @param {Array<String>} allowedRoles List of allowed roles.
 */
export function protectedRoute(handler, allowedRoles = []) {
     return async (req, context) => {
          const user = await getAuthenticatedUser();

          if (!user) {
               return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
          }

          if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
               return NextResponse.json({ success: false, error: 'Forbidden: Insufficient Permissions' }, { status: 403 });
          }

          // Pass user to handler if needed, can attach to req
          req.user = user;
          return handler(req, context);
     };
}
