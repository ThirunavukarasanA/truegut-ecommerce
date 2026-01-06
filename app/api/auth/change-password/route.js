import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req) {
     try {
          const { oldPassword, newPassword } = await req.json();
          const cookieStore = await cookies();
          const token = cookieStore.get('admin_token')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');

          let payload;
          try {
               const result = await jwtVerify(token, secret);
               payload = result.payload;
          } catch (e) {
               return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
          }

          await dbConnect();
          const user = await User.findById(payload.sub);

          if (!user) {
               return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }

          const isMatch = await user.comparePassword(oldPassword);
          if (!isMatch) {
               return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
          }

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);
          await user.save();

          return NextResponse.json({ success: true, message: 'Password updated successfully' });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
