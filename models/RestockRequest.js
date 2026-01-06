
import mongoose from 'mongoose';

const RestockRequestSchema = new mongoose.Schema({
     product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
     },
     variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Variant',
          required: true
     },
     customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer', // Optional link if user was logged in
          default: null
     },
     name: {
          type: String,
          required: true
     },
     email: {
          type: String,
          required: true
     },
     phone: {
          type: String, // Store as string to handle +, -, spaces
          default: null
     },
     status: {
          type: String,
          enum: ['pending', 'notified', 'cancelled'],
          default: 'pending'
     }
}, { timestamps: true });

export default mongoose.models.RestockRequest || mongoose.model('RestockRequest', RestockRequestSchema);
