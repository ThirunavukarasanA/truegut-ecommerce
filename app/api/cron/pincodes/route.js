import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { processNextPendingJob } from '@/lib/admin/pincodeScheduler';

const connectDB = async () => {
     if (mongoose.connections[0].readyState) return;
     await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(req) {
     try {
          // Optional: Verify Authorization header if CRON_SECRET is set
          // const authHeader = req.headers.get('authorization');
          // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

          await connectDB();

          const result = await processNextPendingJob();

          if (result) {
               return NextResponse.json({ message: 'Job processed', ...result });
          } else {
               return NextResponse.json({ message: 'No pending jobs' });
          }
     } catch (error) {
          console.error('[Cron API] Error:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}
