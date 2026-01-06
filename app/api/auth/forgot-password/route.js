import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
     try {
          const { email } = await req.json();
          await dbConnect();

          const user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
               // Generate secure reset token
               const resetToken = crypto.randomBytes(32).toString('hex');
               const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

               // Set token and expiry (1 hour)
               user.resetPasswordToken = resetTokenHash;
               user.resetPasswordExpires = Date.now() + 3600000;

               await user.save();

               // In production: Send email here.
               // For this dev environment, we'll return the token in the response for testing/demo
               return NextResponse.json({
                    success: true,
                    message: 'Password reset link has been sent to your email.',
                    // ONLY FOR DEV/DEMO PURPOSE:
                    debugToken: resetToken
               });
          }

          return NextResponse.json({
               success: true,
               message: 'If an account exists with this email, a password reset link has been sent.'
          });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
