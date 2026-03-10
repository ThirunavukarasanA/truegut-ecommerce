
export async function register() {
     if (process.env.NEXT_RUNTIME === 'nodejs') {

          const cron = await import('node-cron');
          const mongoose = await import('mongoose');
          const { processNextPendingJob } = await import('@/lib/admin/pincodeScheduler');

          // Ensure DB connection
          if (!mongoose.connections[0].readyState) {
               await mongoose.connect(process.env.MONGODB_URI);
          }

          cron.schedule('*/30 * * * * *', async () => {
               console.log('[Cron] Checking for pending jobs...');
               try {
                    const result = await processNextPendingJob();
                    if (result?.job) {
                         console.log(`[Cron] Started job: ${result.job._id}`);
                    }
               } catch (error) {
                    console.error('[Cron] Error processing job:', error);
               }
          });

     }
}
