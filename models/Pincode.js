import mongoose from 'mongoose';

const PincodeSchema = new mongoose.Schema({
     code: {
          type: String,
          required: true,
          unique: true,
          trim: true,
     },
     city: String,
     state: String,
     isServiceable: {
          type: Boolean,
          default: true,
     },
     createdAt: {
          type: Date,
          default: Date.now,
     }
});

export default mongoose.models.Pincode || mongoose.model('Pincode', PincodeSchema);
