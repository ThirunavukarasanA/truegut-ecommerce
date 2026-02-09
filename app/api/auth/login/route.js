import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { signAccessToken, signRefreshToken } from '@/lib/admin/auth-helpers';

export async function POST(req) {
     try {
          const { email, password } = await req.json();

          await dbConnect();

          let user = await User.findOne({ email });

          if (!user) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          // Enforce Role-Based Access
          // Matches roles defined in models/User.js and scripts/seed.mjs
          const allowedRoles = ['system_admin', 'owner', 'admin', 'vendor'];

          if (!allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized: Admin access only' }, { status: 403 });
          }

          // Create Tokens
          const payload = { sub: user._id.toString(), role: user.role, email: user.email };
          const accessToken = await signAccessToken(payload);
          const refreshToken = await signRefreshToken(payload);

          const cookieStore = await cookies();

          // Set Access Token Cookie
          cookieStore.set({
               name: 'admin_access_token',
               value: accessToken,
               httpOnly: true,
               path: '/',
               secure: process.env.NODE_ENV === 'production',
               maxAge: 15 * 60, // 15 minutes
               sameSite: 'lax',
          });

          // Set Refresh Token Cookie
          cookieStore.set({
               name: 'admin_refresh_token',
               value: refreshToken,
               httpOnly: true,
               path: '/',
               secure: process.env.NODE_ENV === 'production',
               maxAge: 7 * 24 * 60 * 60, // 7 days
               sameSite: 'lax',
          });

          return NextResponse.json({
               success: true,
               user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
               }
          });
     } catch (error) {
          console.error("Login error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
