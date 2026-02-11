import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Customer from '@/models/Customer';
import { createAndSetAuthSession } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
    try {
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        await dbConnect();

        // Check if user exists
        let customer = await Customer.findOne({ email });

        if (!customer) {
            // Create new customer
            // Generate a random password since they are using Google
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            customer = await Customer.create({
                name: name,
                email: email,
                password: hashedPassword,
                // You might want to store googleId or a flag 'isGoogleAuth: true' if you modify schema
            });
        }

        // Create Session
        const customerData = await createAndSetAuthSession(customer);

        return NextResponse.json({
            success: true,
            message: 'Google login successful',
            customer: customerData
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
