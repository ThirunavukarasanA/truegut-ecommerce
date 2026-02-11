import StateLoad from '@/models/StateLoad';
import Pincode from '@/models/Pincode';

// Helper to delay execution (Rate limiting)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateStatePincodes(stateData, jobId) {
     const { name: stateName, code: stateCode, range } = stateData;
     console.log(`[Worker] Starting job ${jobId} for state ${stateName}`);

     try {
          // Validate range input first
          if (!range || !Array.isArray(range) || range.length !== 2) {
               throw new Error(`Invalid range format for state ${stateName}. Expected [start, end].`);
          }

          const [start, end] = range;

          // Range Validation (India Pincodes: 110000 - 999999)
          const MIN_PINCODE = 110000;
          const MAX_PINCODE = 999999;

          if (start < MIN_PINCODE || end > MAX_PINCODE || start > end) {
               throw new Error(`Invalid pincode range: ${start}-${end}. Valid range is 110000-999999 and start <= end.`);
          }

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

          // BATCH CONFIG - Optimized for Rate Limits
          // api.postalpincode.in is free and strictly rate-limited.
          // We use a small batch size and a reasonable delay.
          const BATCH_SIZE = 10;
          const BATCH_DELAY = 1500; // 1.5 seconds delay between batches

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
                              .then(res => {
                                   if (!res.ok) {
                                        throw new Error(`HTTP Error ${res.status}`);
                                   }
                                   return res.json();
                              })
                              .then(data => ({ code: codeStr, data })) // Keep full data for validation
                              .catch(err => ({ code: codeStr, error: err.message }))
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
                         // Log details if needed, but for now we just skip
                         continue;
                    }

                    const apiResponse = data[0];
                    const { PostOffice: postOffices } = apiResponse;

                    if (!postOffices || postOffices.length === 0) {
                         continue;
                    }

                    // Prepare DB Operation
                    // We take the first PO to determine District/Region, but store all POs in the array.
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

               // Calculate current pincode correctly for status update
               // currentCode is already incremented to the next batch start
               const lastCodeInBatch = parseInt(currentBatchCodes[currentBatchCodes.length - 1]);

               await StateLoad.findByIdAndUpdate(jobId, {
                    progress,
                    processedPincodes: processed,
                    successCount: success,
                    currentPincode: lastCodeInBatch
               });

               // Memory Cleanup
               batchPromises.length = 0;
               currentBatchCodes.length = 0;
               bulkOps.length = 0;

               // Rate Limiting Delay
               if (currentCode <= end) {
                    await delay(BATCH_DELAY);
               }
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
