import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';

export async function POST(req) {
     try {
          const { name, email, password, phone, address } = await req.json();

          if (!name || !email || !password) {
               return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
          }

          await dbConnect();

          const existingCustomer = await Customer.findOne({ email });
          if (existingCustomer) {
               return NextResponse.json({ error: 'Customer already exists' }, { status: 400 });
          }

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          const customer = await Customer.create({
               name,
               email,
               password: hashedPassword,
               phone,
               address,
          });

          return NextResponse.json({
               success: true,
               customer: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email,
               }
          }, { status: 201 });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
