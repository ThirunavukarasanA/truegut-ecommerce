import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';

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
          const allowedRoles = ['system_admin', 'owner', 'admin'];

          if (!allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized: Admin access only' }, { status: 403 });
          }

          // Create JWT
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          const alg = 'HS256';

          const token = await new SignJWT({ sub: user._id.toString(), role: user.role, email: user.email })
               .setProtectedHeader({ alg })
               .setIssuedAt()
               .setExpirationTime('24h')
               .sign(secret);

          // Set Cookie
          (await cookies()).set({
               name: 'admin_token',
               value: token,
               httpOnly: true,
               path: '/',
               secure: process.env.NODE_ENV === 'production',
               maxAge: 60 * 60 * 24, // 1 day
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
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
