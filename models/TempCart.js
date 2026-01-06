import mongoose from 'mongoose';

const TempCartSchema = new mongoose.Schema({
     sessionId: {
          type: String,
          required: true,
          unique: true,
          index: true,
     },
     items: [
          {
               productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
               },
               variantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Variant',
               },
               quantity: {
                    type: Number,
                    required: true,
                    default: 1,
               },
               price: Number,
               name: String,
               image: String,
          },
     ],
     metadata: {
          userAgent: String,
          deviceType: String,
          ipAddress: String,
          location: String,
     },
     createdAt: {
          type: Date,
          default: Date.now,
          expires: 2592000, // 30 days in seconds
     },
     updatedAt: {
          type: Date,
          default: Date.now,
     },
});


export default mongoose.models.TempCart || mongoose.model('TempCart', TempCartSchema);
