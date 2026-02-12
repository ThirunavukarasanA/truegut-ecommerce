import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const CustomerSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
     },
     email: {
          type: String,
          required: true,
          unique: true,
     },
     password: {
          type: String,
          required: true,
     },
     phone: {
          type: String,
     },
     address: {
          type: String,
     },
}, { timestamps: true });


// Method to compare password
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
     return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
