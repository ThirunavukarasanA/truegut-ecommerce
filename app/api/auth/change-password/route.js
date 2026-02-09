import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/admin/email';
import { passwordChangedTemplate } from '@/lib/admin/email-templates';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function POST(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { oldPassword, newPassword } = await req.json();

          const isMatch = await user.comparePassword(oldPassword);
          if (!isMatch) {
               return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
          }

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);
          await user.save();

          // Send Email Notification
          try {
               await sendEmail({
                    to: user.email,
                    subject: 'Security Alert: Password Changed',
                    html: passwordChangedTemplate()
               });
          } catch (emailError) {
               console.error("Failed to send password change email:", emailError);
               // Continue success flow even if email fails
          }

          return NextResponse.json({ success: true, message: 'Password updated successfully' });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
