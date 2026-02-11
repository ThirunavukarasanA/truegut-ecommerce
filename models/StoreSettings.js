import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema({
     storeName: {
          type: String,
          default: "Fermentaa Kombucha",
          trim: true
     },
     supportEmail: {
          type: String,
          default: "support@fermentaa.com",
          lowercase: true
     },
     supportPhone: {
          type: String,
          default: "+91 98765 43210"
     },
     storeAddress: {
          type: String,
          default: "Bangalore, India"
     },
     currency: {
          code: { type: String, default: "INR" },
          symbol: { type: String, default: "₹" }
     },
     updatedAt: {
          type: Date,
          default: Date.now
     }
}, { timestamps: true });

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
