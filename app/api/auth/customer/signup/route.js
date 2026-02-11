import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';

export async function POST(req) {
     try {
          const { name, email, password, phone } = await req.json();

          if (!name || !email || !password) {
               return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
          }

          await dbConnect();

          // Check if customer already exists
          const existingCustomer = await Customer.findOne({ email });
          if (existingCustomer) {
               return NextResponse.json({ error: 'Customer already exists' }, { status: 400 });
          }

          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Create customer
          const customer = await Customer.create({
               name,
               email,
               password: hashedPassword,
               phone
          });

          // Send Welcome Email
          try {
               const { sendEmail } = await import('@/lib/admin/email');
               const { welcomeTemplate } = await import('@/lib/admin/email-templates');

               await sendEmail({
                    to: customer.email,
                    subject: 'Welcome to Fermentaa!',
                    html: welcomeTemplate(customer.name)
               });
          } catch (emailError) {
               console.error("Welcome Email Failed:", emailError);
               // Don't block registration if email fails
          }

          return NextResponse.json({
               success: true,
               message: 'Account created successfully',
               customer: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email
               }
          }, { status: 201 });

     } catch (error) {
          console.error("Signup Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
