import StateLoad from '@/models/StateLoad';
import Pincode from '@/models/Pincode';

// Helper to delay execution (Rate limiting)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateStatePincodes(stateData, jobId) {
     const { name: stateName, _id: stateId } = stateData;
     try {
          // 1. Identify Pincodes to Process
          // We look for pincodes in this state that are "pending" OR "failed" (retrying)
          // OR simply "pending" to start.

          // Count total for progress tracking
          const totalPending = await Pincode.countDocuments({
               stateId: stateId,
               status: { $in: ['pending', 'failed'] }
          });

          // Check if we are resuming? 
          //Actually the "Pending" status IS the resume mechanism effectively.
          // But we need to track "Total" for the Job UI.

          const existingJob = await StateLoad.findById(jobId);
          let processed = existingJob ? existingJob.processedPincodes : 0;
          let success = existingJob ? existingJob.successCount : 0;

          // Update Job Start
          await StateLoad.findByIdAndUpdate(jobId, {
               status: 'running',
               totalPincodes: totalPending + processed, // Approximation if we are mid-way
               startedAt: existingJob?.startedAt || new Date(),
               updatedAt: new Date()
          });


          // BATCH CONFIG
          const BATCH_SIZE = 25;
          const MIN_DELAY = 100;
          let currentDelay = 200;

          let hasMore = true;

          while (hasMore) {
               // Fetch a batch of pending pincodes
               const batchDocs = await Pincode.find({
                    stateId: stateId,
                    status: { $in: ['pending', 'failed'] }
               }).limit(BATCH_SIZE).select('pincode _id');

               if (batchDocs.length === 0) {
                    hasMore = false;
                    break;
               }

               const batchPromises = [];
               const currentBatchIds = [];

               // Prepare Requests
               for (const doc of batchDocs) {
                    currentBatchIds.push(doc._id);
                    batchPromises.push(
                         fetch(`https://api.postalpincode.in/pincode/${doc.pincode}`)
                              .then(async res => {
                                   if (res.status === 429) throw new Error('Rate Limit');
                                   if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
                                   return res.json();
                              })
                              .then(data => ({ id: doc._id, pincode: doc.pincode, data, status: 'fulfilled' }))
                              .catch(err => {
                                   if (err.message === 'Rate Limit') return { id: doc._id, error: 'Rate Limit', status: 'rate_limit' };
                                   return { id: doc._id, pincode: doc.pincode, error: err.message, status: 'rejected' };
                              })
                    );
               }

               // Execute Batch
               const results = await Promise.all(batchPromises);
               const bulkOps = [];
               let hitRateLimit = false;

               for (const result of results) {
                    if (result.status === 'rate_limit') {
                         hitRateLimit = true;
                         continue; // Skip processing this one, it remains 'pending'/'failed'
                    }

                    if (result.status === 'rejected') {
                         // Mark as failed temporarily?
                         bulkOps.push({
                              updateOne: {
                                   filter: { _id: result.id },
                                   update: {
                                        $set: {
                                             status: 'failed',
                                             error: result.error
                                        }
                                   }
                              }
                         });
                         continue;
                    }

                    const { data } = result;

                    // Validation
                    if (!Array.isArray(data) || data.length === 0 || data[0].Status === 'Error') {
                         // Invalid Pincode? Mark as completed but inactive/invalid?
                         // Or just 'failed' with error "No data".
                         // actually if postalpincode.in says it exists but api says no...
                         // Let's mark as 'active' false, status 'completed' (so we don't retry forever)
                         bulkOps.push({
                              updateOne: {
                                   filter: { _id: result.id },
                                   update: {
                                        $set: {
                                             status: 'completed',
                                             active: false,
                                             isServiceable: false,
                                             error: 'No data from API'
                                        }
                                   }
                              }
                         });
                         processed++; // We processed it, it just had no data
                         continue;
                    }

                    const apiResponse = data[0];
                    const { PostOffice: postOffices } = apiResponse;

                    if (!postOffices || postOffices.length === 0) {
                         bulkOps.push({
                              updateOne: {
                                   filter: { _id: result.id },
                                   update: {
                                        $set: {
                                             status: 'completed',
                                             active: false,
                                             error: 'No PostOffice data'
                                        }
                                   }
                              }
                         });
                         processed++;
                         continue;
                    }

                    const mainPO = postOffices[0];
                    bulkOps.push({
                         updateOne: {
                              filter: { _id: result.id },
                              update: {
                                   $set: {
                                        district: mainPO.District,
                                        isServiceable: true,
                                        active: true,
                                        status: 'active', // SUCCESS
                                        error: null,
                                        postOffices: postOffices.map(po => ({
                                             name: po.Name,
                                             branchType: po.BranchType,
                                             deliveryStatus: po.DeliveryStatus,
                                             circle: po.Circle,
                                             district: po.District,
                                             division: po.Division,
                                             region: po.Region,
                                             block: po.Block,
                                             state: po.State,
                                             country: po.Country,
                                             pincode: po.Pincode
                                        }))
                                   }
                              }
                         }
                    });
                    success++;
                    processed++;
               }

               // Bulk Write
               if (bulkOps.length > 0) {
                    await Pincode.bulkWrite(bulkOps);
               }

               // Update Job Progress
               const progress = totalPending > 0 ? Math.round((processed / (totalPending + processed)) * 100) : 0; // rough est
               await StateLoad.findByIdAndUpdate(jobId, {
                    processedPincodes: processed,
                    successCount: success,
                    // progress: progress, // Logic for progress is tricky with dynamic total, let UI calculate or just update what we can
                    updatedAt: new Date()
               });

               // Backoff / Delay Logic
               if (hitRateLimit) {

                    currentDelay = Math.min(currentDelay * 2, 60000); // 60s max
                    await delay(currentDelay);
                    // We do NOT break here, we just loop again. 
                    // Since we didn't update status of rate-limited docs, they will be fetched effectively again?
                    // Wait, if we just queried them and didn't change status, we wil fetch same docs again.
                    // This is good for retry. But we need delay.
               } else {
                    // Success - recover speed
                    if (currentDelay > MIN_DELAY) currentDelay = Math.max(MIN_DELAY, currentDelay * 0.9);
                    await delay(currentDelay);
               }
          }

          // FINISHED
          await StateLoad.findByIdAndUpdate(jobId, {
               status: 'completed',
               progress: 100,
               finishedAt: new Date()
          });

     } catch (error) {
          console.error(`[Worker] Job ${jobId} failed:`, error);
          await StateLoad.findByIdAndUpdate(jobId, {
               status: 'failed',
               error: error.message,
               finishedAt: new Date()
          });
     }
}
