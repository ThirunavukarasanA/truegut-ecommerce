
export async function register() {
     if (process.env.NEXT_RUNTIME === 'nodejs') {

          const cron = await import('node-cron');
          const mongoose = await import('mongoose');
          const { processNextPendingJob } = await import('@/lib/admin/pincodeScheduler');

          // Ensure DB connection
          if (!mongoose.connections[0].readyState) {
               await mongoose.connect(process.env.MONGODB_URI);
          }

          cron.schedule('*/10 * * * * *', async () => {
               try {
                    await processNextPendingJob();
               } catch (error) {
                    console.error('[Cron] Error processing job:', error);
               }
          });

     }
}
