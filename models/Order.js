import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
     product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
     },
     variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Variant',
     },
     // Product snapshot at time of order
     productSnapshot: {
          name: String,
          image: String,
          sku: String,
          variantName: String, // Added variant name snapshot
     },
     quantity: {
          type: Number,
          required: true,
          min: 1,
     },
     price: Number, // Snapshot of price at time of order
     // Track which batches fulfilled this item
     batches: [{
          batch: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Batch'
          },
          quantity: Number
     }],
});

const OrderSchema = new mongoose.Schema({
     customer: {
          name: String,
          email: String,
          phone: String,
          address: {
               street: String,
               city: String,
               state: String,
               pincode: String,
          }
     },
     items: [OrderItemSchema],
     totalAmount: {
          type: Number,
          required: true,
     },
     status: {
          type: String,
          enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returns'],
          default: 'Pending',
     },
     paymentStatus: {
          type: String,
          enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
          default: 'Pending',
     },
     paymentDetails: {
          method: {
               type: String,
               enum: ['COD', 'UPI', 'Card', 'NetBanking', 'Wallet'],
          },
          transactionId: String,
          paidAt: Date,
          refundedAt: Date,
          refundAmount: Number,
     },
     deliveryDetails: {
          mode: {
               type: String,
               enum: ['Local', 'Shiprocket'],
          },
          // Local / General details
          courierName: String,
          courierPhone: String,
          trackingId: String,
          trackingUrl: String,
          driverName: String,
          driverPhone: String,
          transportMode: String,

          // Shiprocket specific
          shiprocketOrderId: String,
          shipmentId: String,
          awbCode: String,

          shippedAt: Date,
          deliveredAt: Date
     },
     vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor',
     },
     trackingNumber: String,
     notes: String,
     createdAt: {
          type: Date,
          default: Date.now,
     },
     updatedAt: {
          type: Date,
          default: Date.now,
     }
}, {
     timestamps: true,
     strictPopulate: false
});

// Update the updatedAt timestamp on save
// Update the updatedAt timestamp on save
OrderSchema.pre('save', function () {
     this.updatedAt = Date.now();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
