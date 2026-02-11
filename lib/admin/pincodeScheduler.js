import StateLoad from '@/models/StateLoad';
import State from '@/models/State';
import { generateStatePincodes } from '@/lib/admin/pincodeGeneration';

export async function processNextPendingJob() {
     // 1. Find a PENDING job
     const pendingJob = await StateLoad.findOne({ status: 'pending' });
     if (!pendingJob) {
          return null; // No work to do
     }

     // 2. Mark as running immediately
     pendingJob.status = 'running';
     pendingJob.startedAt = new Date();
     await pendingJob.save();

     // 3. Fetch State Data
     const stateDoc = await State.findById(pendingJob.stateId);

     if (stateDoc) {
          // 4. Fire and forget worker
          // We don't await this because we want to return quickly to the caller (Cron/Status API)
          generateStatePincodes(stateDoc, pendingJob._id).catch(err => {
               console.error("[PincodeScheduler] Worker failed:", err);
          });
          return { job: pendingJob, status: 'started' };
     } else {
          pendingJob.status = 'failed';
          pendingJob.error = 'State data not found';
          await pendingJob.save();
          return { job: pendingJob, status: 'failed_state_missing' };
     }
}
