import StateLoad from '@/models/StateLoad';
import Pincode from '@/models/Pincode';

// Helper to delay execution (Rate limiting)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateStatePincodes(stateData, jobId) {
     const { name: stateName, code: stateCode, range } = stateData;
     console.log(`[Worker] Starting job ${jobId} for state ${stateName}`);

     try {
          const [start, end] = range;
          let currentCode = start;
          let processed = 0;
          let success = 0;
          const total = end - start + 1;

          // Update initial status
          await StateLoad.findByIdAndUpdate(jobId, {
               status: 'running',
               totalPincodes: total,
               startedAt: new Date()
          });

          // BATCH CONFIG
          const BATCH_SIZE = 100; // Concurrency limit
          const BATCH_DELAY = 200; // ms delay between batches to respect rate limits

          while (currentCode <= end) {
               const batchPromises = [];
               const currentBatchCodes = [];

               // Prepare batch
               for (let i = 0; i < BATCH_SIZE && currentCode <= end; i++) {
                    const codeStr = currentCode.toString();
                    currentBatchCodes.push(codeStr);

                    // Fetch external API
                    // Note: The API returns an ARRAY: [{ Message, Status, PostOffice: [] }]
                    // We catch errors and return a standardized object
                    batchPromises.push(
                         fetch(`https://api.postalpincode.in/pincode/${codeStr}`)
                              .then(res => res.json())
                              .then(data => ({ code: codeStr, data })) // Keep full data for validation
                              .catch(err => ({ code: codeStr, error: err }))
                    );
                    currentCode++;
               }

               // Execute batch
               const results = await Promise.all(batchPromises);
               const bulkOps = [];

               for (const result of results) {
                    const { code, data, error } = result;

                    // Validation: Check for network error, array structure, and Success Status
                    // data needs to be Array, and first item should be Success
                    if (error || !Array.isArray(data) || data.length === 0 || data[0].Status !== 'Success') {
                         continue;
                    }

                    const apiResponse = data[0];
                    const { PostOffice: postOffices } = apiResponse;

                    if (!postOffices || postOffices.length === 0) {
                         continue;
                    }

                    // Prepare DB Operation
                    // We take the first PO to determine District/Region usually, but strictly we store all POs.
                    const mainPO = postOffices[0];

                    bulkOps.push({
                         updateOne: {
                              filter: { pincode: code },
                              update: {
                                   $set: {
                                        pincode: code,
                                        state: stateName,
                                        stateCode,
                                        district: mainPO.District,
                                        isServiceable: true,
                                        active: true,
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
                              },
                              upsert: true
                         }
                    });
                    success++;
               }

               // Bulk Write to DB
               if (bulkOps.length > 0) {
                    await Pincode.bulkWrite(bulkOps);
               }

               // Update Progress
               processed += currentBatchCodes.length;
               const progress = Math.round((processed / total) * 100);

               // Update Job Status every batch
               // Use atomic increment if needed, but absolute set is safer for retry logic
               const lastCode = currentBatchCodes[currentBatchCodes.length - 1];
               await StateLoad.findByIdAndUpdate(jobId, {
                    progress,
                    processedPincodes: processed,
                    successCount: success,
                    currentPincode: lastCode
               });

               // Memory Cleanup
               batchPromises.length = 0;
               currentBatchCodes.length = 0;
               bulkOps.length = 0;

               // Rate Limiting Delay
               await delay(BATCH_DELAY);
          }

          // FINISHED
          await StateLoad.findByIdAndUpdate(jobId, {
               status: 'completed',
               progress: 100,
               finishedAt: new Date()
          });
          console.log(`[Worker] Job ${jobId} completed.`);

     } catch (error) {
          console.error(`[Worker] Job ${jobId} failed:`, error);
          await StateLoad.findByIdAndUpdate(jobId, {
               status: 'failed',
               error: error.message,
               finishedAt: new Date()
          });
     }
}
