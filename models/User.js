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
     resetPasswordToken: String,
     resetPasswordExpires: Date,
}, { timestamps: true });


// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
     return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
