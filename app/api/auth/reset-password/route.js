import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
     try {
          const { token, newPassword } = await req.json();
          await dbConnect();

          // Hash the provided token (since we stored the hash)
          const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

          // Find user with matching token and valid expiry
          const user = await User.findOne({
               resetPasswordToken: resetTokenHash,
               resetPasswordExpires: { $gt: Date.now() }
          });

          if (!user) {
               return NextResponse.json({
                    success: false,
                    error: 'Invalid or expired reset token'
               }, { status: 400 });
          }

          // Update password
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);

          // Clear reset fields
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          await user.save();

          return NextResponse.json({
               success: true,
               message: 'Password has been reset successfully. You can now login.'
          });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
