import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import StateLoad from '@/models/StateLoad';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import { processNextPendingJob } from '@/lib/admin/pincodeScheduler';

const connectDB = async () => {
     if (mongoose.connections[0].readyState) return;
     await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(req) {
     try {
          await connectDB();
          const user = await getAuthenticatedUser(req);
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // 1. Trigger processing if user is watching (Lazy Cron)
          await processNextPendingJob();

          // 2. Return active jobs
          const runningJobs = await StateLoad.find({
               status: { $in: ['pending', 'running', 'inprogress'] }
          }).sort({ updatedAt: -1 });

          return NextResponse.json(runningJobs);
     } catch (error) {
          console.error('Error fetching job status:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}
