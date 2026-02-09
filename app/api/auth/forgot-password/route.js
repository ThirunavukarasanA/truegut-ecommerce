import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/admin/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/admin/email';
import { passwordResetTemplate } from '@/lib/admin/email-templates';

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

               // Construct Reset URL
               // Note: Ideally, use an environment variable for the base URL. 
               // Fallback to origin if not set, or hardcode for dev if needed.
               const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3051';
               const resetUrl = `${baseUrl}/admin/reset-password/${resetToken}`;

               // Send Email
               const emailResult = await sendEmail({
                    to: user.email,
                    subject: 'Password Reset Request',
                    html: passwordResetTemplate(resetUrl, user.role !== 'customer')
               });

               if (!emailResult.success) {
                    console.error('Failed to send reset email:', emailResult.error);
                    // Decide whether to fail the request or just log it. 
                    // Usually better to fail so user knows.
                    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
               }

               return NextResponse.json({
                    success: true,
                    message: 'Password reset link has been sent to your email.',
                    // KEEPING DEBUG TOKEN FOR DEV CONVENIENCE UNTIL SMTP IS VERIFIED BY USER
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
