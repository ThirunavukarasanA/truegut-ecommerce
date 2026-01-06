import { NextResponse } from 'next/server';

export async function POST(req) {
     try {
          const { amount, currency = 'INR' } = await req.json();

          // mock payment intent creation
          // In real implementation: stripe.paymentIntents.create({...})

          if (!amount) {
               return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
          }

          return NextResponse.json({
               success: true,
               clientSecret: `mock_secret_${Date.now()}_${Math.random().toString(36).substring(7)}`,
               amount,
               currency,
               message: "This is a mock payment intent. Replace with real gateway logic."
          });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
