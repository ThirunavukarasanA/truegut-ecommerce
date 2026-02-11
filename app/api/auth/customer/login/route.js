import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Customer from '@/models/Customer';
import { createAndSetAuthSession } from '@/lib/auth';

export async function POST(req) {
     try {
          const { email, password } = await req.json();

          if (!email || !password) {
               return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
          }

          await dbConnect();

          // 1. Validate Customer
          const customer = await Customer.findOne({ email });
          if (!customer) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          const isMatch = await customer.comparePassword(password);
          if (!isMatch) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          // 2. Create Session (Token + Cookie + Cart Merge)
          const customerData = await createAndSetAuthSession(customer);

          return NextResponse.json({
               success: true,
               message: 'Login successful',
               customer: customerData
          });

     } catch (error) {
          console.error("Login Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
