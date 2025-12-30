import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
          trim: true,
     },
     email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
     },
     phone: {
          type: String,
          required: true,
     },
     address: String,
     serviceablePincodes: [String], // Array of pincode strings
     stock: {
          type: Number,
          default: 0,
     },
     isActive: {
          type: Boolean,
          default: true,
     },
     createdAt: {
          type: Date,
          default: Date.now,
     }
});

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
