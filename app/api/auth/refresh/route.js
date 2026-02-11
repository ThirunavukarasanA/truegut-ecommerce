import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, signAccessToken } from '@/lib/admin/auth-helpers';

export async function POST() {
     try {
          const cookieStore = await cookies();
          const refreshToken = cookieStore.get('admin_refresh_token')?.value;

          if (!refreshToken) {
               return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
          }

          // Verify the refresh token
          const payload = await verifyToken(refreshToken);

          if (!payload) {
               return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
          }

          // Create new Access Token
          // We assume payload contains sub (userId), role, email from login route
          const newPayload = {
               sub: payload.sub,
               role: payload.role,
               email: payload.email
          };

          const newAccessToken = await signAccessToken(newPayload);

          // Set new Access Token Cookie
          // Note: We don't rotate the refresh token here to keep it simple, 
          // but typically you might extend its life or issue a new one. 
          // For now, just issue a new access token.
          cookieStore.set({
               name: 'admin_access_token',
               value: newAccessToken,
               httpOnly: true,
               path: '/',
               secure: process.env.NODE_ENV === 'production',
               maxAge: 15 * 60, // 15 minutes
               sameSite: 'lax',
          });

          return NextResponse.json({ success: true });

     } catch (error) {
          console.error("Refresh error:", error);
          return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
     }
}
