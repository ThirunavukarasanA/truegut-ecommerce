import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
     product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
     },
     quantity: {
          type: Number,
          required: true,
          min: 1,
     },
     price: Number, // Snapshot of price at time of order
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
          enum: ['Pending', 'Paid', 'Failed'],
          default: 'Pending',
     },
     vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor',
     },
     createdAt: {
          type: Date,
          default: Date.now,
     }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
