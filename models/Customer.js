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
     createdAt: {
          type: Date,
          default: Date.now,
     },
});

// Pre-save hook to hash password
CustomerSchema.pre('save', async function () {
     if (!this.isModified('password')) {
          return;
     }
     try {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
     } catch (error) {
          throw new Error(error);
     }
});

// Method to compare password
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
     return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
