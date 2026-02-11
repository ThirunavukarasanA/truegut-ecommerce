import mongoose from 'mongoose';

const VendorStockSchema = new mongoose.Schema({
     vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor',
          required: true,
          index: true
     },
     product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
          index: true
     },
     variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Variant',
          required: true
     },
     batch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Batch',
          required: true
     },
     quantity: {
          type: Number,
          required: true,
          min: 0,
          default: 0
     },
     receivedAt: {
          type: Date,
          default: Date.now
     }
}, { timestamps: true });

// Prevent duplicate entries for same batch assignment if needed, or just allow multiple transfers
// For now, let's keep it simple: one record per vendor-batch pair is probably best to track specific batch lifecycle
// Removed unique index to allow multiple allocation records for the same batch
// VendorStockSchema.index({ vendor: 1, batch: 1 }, { unique: true });

export default mongoose.models.VendorStock || mongoose.model('VendorStock', VendorStockSchema);
