import { NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { amount } = await req.json();

        // Amount must be in paise (1 INR = 100 paise)
        const payment_capture = 1;
        const currency = 'INR';
        const options = {
            amount: (amount * 100).toString(),
            currency,
            receipt: uuidv4(),
            payment_capture,
        };

        const response = await razorpay.orders.create(options);
        
        return NextResponse.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
