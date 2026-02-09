
import mongoose from 'mongoose';

const TempCustomerSchema = new mongoose.Schema({
     sessionId: {
          type: String,
          required: true,
          unique: true,
          index: true,
     },
     firstName: String,
     lastName: String,
     email: String,
     phone: String,
     address: {
          street: String,
          city: String,
          state: String,
          pincode: String,
          country: String,
     },
     location: {
          pincode: String,
          postOffice: String,
          district: String,
          vendorId: String,
          vendorName: String,
     },
     createdAt: {
          type: Date,
          default: Date.now,
          expires: 60 * 60 * 24 * 7, // 7 days
     },
});

export default mongoose.models.TempCustomer || mongoose.model('TempCustomer', TempCustomerSchema);
