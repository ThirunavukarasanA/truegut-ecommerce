import Batch from '@/models/Batch';
import VendorStock from '@/models/VendorStock';

export class StockManager {
     constructor() {
          this.rollbackActions = [];
     }

     /**
      * Deducts stock for a list of items based on vendor assignment.
      * @param {Array} items - Array of items with { variant, quantity }
      * @param {String} assignedVendorId - Optional vendor ID
      * @returns {Promise<Array>} - Array of processed items with batch details
      */
     async deductStockForItems(items, assignedVendorId) {
          const processedItems = [];

          try {
               for (const item of items) {
                    const { variant, quantity } = item;
                    let remainingToDeduct = quantity;
                    const usedBatches = [];

                    if (assignedVendorId) {
                         // --- VENDOR STOCK LOGIC ---
                         const vendorStocks = await VendorStock.find({
                              vendor: assignedVendorId,
                              variant: variant._id,
                              quantity: { $gt: 0 }
                         }).sort({ receivedAt: 1 });

                         for (const vStock of vendorStocks) {
                              if (remainingToDeduct <= 0) break;

                              const take = Math.min(vStock.quantity, remainingToDeduct);

                              const updatedVStock = await VendorStock.findOneAndUpdate(
                                   { _id: vStock._id, quantity: { $gte: take } },
                                   { $inc: { quantity: -take } },
                                   { new: true }
                              );

                              if (updatedVStock) {
                                   remainingToDeduct -= take;
                                   usedBatches.push({ batch: vStock.batch, quantity: take });
                                   // Track for rollback
                                   this.rollbackActions.push({
                                        type: 'VENDOR_STOCK',
                                        id: vStock._id,
                                        quantity: take
                                   });
                              }
                         }

                         if (remainingToDeduct > 0) {
                              throw new Error(`Insufficient stock for ${variant.name} (Vendor).`);
                         }

                    } else {
                         // --- WAREHOUSE BATCH LOGIC ---
                         const batches = await Batch.find({
                              variant: variant._id,
                              status: 'active',
                              expiryDate: { $gt: new Date() },
                              quantity: { $gt: 0 }
                         }).sort({ expiryDate: 1 });

                         for (const batch of batches) {
                              if (remainingToDeduct <= 0) break;

                              const take = Math.min(batch.quantity, remainingToDeduct);

                              const updatedBatch = await Batch.findOneAndUpdate(
                                   { _id: batch._id, quantity: { $gte: take } },
                                   { $inc: { quantity: -take } },
                                   { new: true }
                              );

                              if (updatedBatch) {
                                   remainingToDeduct -= take;
                                   usedBatches.push({ batch: batch._id, quantity: take });
                                   // Track for rollback
                                   this.rollbackActions.push({
                                        type: 'BATCH',
                                        id: batch._id,
                                        quantity: take
                                   });
                              }
                         }

                         if (remainingToDeduct > 0) {
                              throw new Error(`Insufficient stock for ${variant.name} (Warehouse).`);
                         }
                    }

                    processedItems.push({
                         variant: variant._id,
                         batches: usedBatches
                    });
               }

               return processedItems;

          } catch (error) {
               await this.rollback();
               throw error;
          }
     }

     /**
      * Rolls back all tracked stock deductions.
      */
     async rollback() {
          ("Rolling back stock actions...", this.rollbackActions.length);
          for (const action of this.rollbackActions.reverse()) {
               try {
                    if (action.type === 'VENDOR_STOCK') {
                         await VendorStock.findByIdAndUpdate(action.id, { $inc: { quantity: action.quantity } });
                    } else if (action.type === 'BATCH') {
                         await Batch.findByIdAndUpdate(action.id, { $inc: { quantity: action.quantity } });
                    }
               } catch (err) {
                    console.error(`Failed to rollback ${action.type} ${action.id}:`, err);
               }
          }
     }
}
