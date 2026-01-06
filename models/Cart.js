import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
     customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: true,
          unique: true,
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
     updatedAt: {
          type: Date,
          default: Date.now,
     },
});


export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
