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

// Ensure unique record for each vendor-batch pair to track specific batch lifecycle
VendorStockSchema.index({ vendor: 1, variant: 1, batch: 1 }, { unique: true });

export default mongoose.models.VendorStock || mongoose.model('VendorStock', VendorStockSchema);
