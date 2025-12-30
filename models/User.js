import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
     email: {
          type: String,
          required: true,
          unique: true,
     },
     password: {
          type: String,
          required: true,
     },
     role: {
          type: String,
          enum: ['user', 'admin', 'system_admin', 'owner', 'vendor'],
          default: 'user',
     },
     createdAt: {
          type: Date,
          default: Date.now,
     },
});

// Pre-save hook to hash password
UserSchema.pre('save', async function () {
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
UserSchema.methods.comparePassword = async function (candidatePassword) {
     return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
