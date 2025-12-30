import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
     try {
          const { email } = await req.json();
          await dbConnect();

          // Check if user exists (Optional: Don't reveal existence for security, but for admin panel internal tool it helps)
          const user = await User.findOne({ email });

          if (user) {
               // In real app: Generate token, save to DB with expiry, send link to email
          }

          return NextResponse.json({
               success: true,
               message: 'If an account exists with this email, a password reset link has been sent.'
          });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
