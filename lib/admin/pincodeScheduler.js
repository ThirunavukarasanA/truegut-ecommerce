import StateLoad from '@/models/StateLoad';
import State from '@/models/State';
import { generateStatePincodes } from '@/lib/admin/pincodeGeneration';

// 2 minutes timeout for stuck jobs (Server restart recovery)
const STUCK_JOB_TIMEOUT = 15 * 1000;

export async function processNextPendingJob() {
     // 0. Check for stuck jobs and reset them
     const stuckCutoff = new Date(Date.now() - STUCK_JOB_TIMEOUT);
     const stuckJobs = await StateLoad.find({
          status: 'running',
          updatedAt: { $lt: stuckCutoff }
     });

     if (stuckJobs.length > 0) {
          for (const job of stuckJobs) {
               job.status = 'pending';
               job.error = 'Job timed out (stuck). Resetting to pending.';
               await job.save();
          }
     }

     // 1. Check if any job is currently running (and healthy)
     const runningJob = await StateLoad.findOne({ status: 'running' });
     if (runningJob) {
          // Job is running and updated recently enough
          return { message: 'A job is already running.', jobId: runningJob._id };
     }

     // 2. Find a PENDING job
     const pendingJob = await StateLoad.findOne({ status: 'pending' }).sort({ createdAt: 1 });
     if (!pendingJob) {
          return null; // No work to do
     }

     // 3. Mark as running immediately
     pendingJob.status = 'running';
     pendingJob.startedAt = new Date();
     pendingJob.updatedAt = new Date(); // Important for stuck detection
     await pendingJob.save();

     // 4. Fetch State Data
     const stateDoc = await State.findById(pendingJob.stateId);

     if (stateDoc) {
          // 5. Fire and forget worker
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
