import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/admin/db';
import Customer from '@/models/Customer';
import { sendEmail } from '@/lib/admin/email';
import { passwordResetTemplate } from '@/lib/admin/email-templates';

export async function POST(req) {
     try {
          const { email } = await req.json();
          await dbConnect();

          const customer = await Customer.findOne({ email: email.toLowerCase() });

          if (customer) {
               // Generate secure reset token
               const resetToken = crypto.randomBytes(32).toString('hex');
               const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

               // Set token and expiry (1 hour)
               customer.resetPasswordToken = resetTokenHash;
               customer.resetPasswordExpires = Date.now() + 3600000;

               await customer.save();

               // Construct Reset URL for Customer
               const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3051';
               // Assuming customer reset page is at /reset-password
               const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

               // Send Email
               const emailResult = await sendEmail({
                    to: customer.email,
                    subject: 'Password Reset Request',
                    html: passwordResetTemplate(resetUrl, true) // isUser = true (Customer)
               });

               if (!emailResult.success) {
                    console.error('Failed to send reset email:', emailResult.error);
                    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
               }

               return NextResponse.json({
                    success: true,
                    message: 'Password reset link has been sent to your email.',
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
