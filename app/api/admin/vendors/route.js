import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Vendor from '@/models/Vendor';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import { sendEmail } from '@/lib/admin/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import VendorStock from '@/models/VendorStock'; // Ensure model is loaded

export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const search = searchParams.get('search');

          let query = {};
          if (search) {
               query.name = { $regex: search, $options: 'i' };
          }

          // Role-based filtering
          if (user.role === 'vendor') {
               query.userId = user._id; // Restrict to self
          }

          // Populate connected user info if needed, but for list primarily vendor details
          // Populate connected user info if needed, but for list primarily vendor details
          const vendors = await Vendor.aggregate([
               { $match: query },
               {
                    $lookup: {
                         from: 'vendorstocks',
                         localField: '_id',
                         foreignField: 'vendor',
                         as: 'stocks'
                    }
               },
               {
                    $addFields: {
                         stock: { $sum: "$stocks.quantity" }
                    }
               },
               {
                    $project: {
                         stocks: 0,
                         __v: 0
                    }
               },
               { $sort: { createdAt: -1 } }
          ]);

          return NextResponse.json({ success: true, data: vendors });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     const user = await getAuthenticatedUser();
     // Only owner/system_admin can register vendors
     const allowedRoles = ['system_admin', 'owner', 'admin']; // Expanded to admin if they are managing vendors
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const body = await req.json();

          if (!body.email || !body.name || !body.phone) {
               return NextResponse.json({ error: 'Name, Email and Phone are required' }, { status: 400 });
          }

          const email = body.email.toLowerCase();

          // Check if Vendor or User already exists
          const existingVendor = await Vendor.findOne({ email });
          if (existingVendor) {
               return NextResponse.json({ error: 'A vendor with this email already exists' }, { status: 400 });
          }

          const existingUser = await User.findOne({ email });
          if (existingUser) {
               return NextResponse.json({ error: 'A user account with this email already exists' }, { status: 400 });
          }

          // Generate Random Password
          const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 char string
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          // Create User
          const newUser = await User.create({
               email,
               password: hashedPassword,
               role: 'vendor'
          });

          // Create Vendor
          const vendor = await Vendor.create({
               ...body,
               email,
               userId: newUser._id,
               // Ensure arrays are initialized
               serviceablePincodes: body.serviceablePincodes || []
          });

          // Send Email
          const emailSubject = 'Welcome to Fermentaa - Vendor Account Details';
          const emailHtml = `
               <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Welcome, ${body.name}!</h2>
                    <p>Your vendor account has been created successfully.</p>
                    <p><strong>Company:</strong> ${body.companyName || 'N/A'}</p>
                    <p>You can now login to the vendor portal to manage your orders.</p>
                    <hr />
                    <h3>Login Credentials:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${randomPassword}</p>
                    <hr />
                    <p>Please login and change your password immediately.</p>
               </div>
          `;

          // await sendEmail({
          //      to: email,
          //      subject: emailSubject,
          //      html: emailHtml
          // });

          return NextResponse.json({ success: true, data: vendor });
     } catch (error) {
          console.error("Vendor Registration Error:", error);
          return NextResponse.json({ error: error.message }, { status: 400 });
     }
}
