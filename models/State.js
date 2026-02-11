import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
          unique: true,
          trim: true,
     },
     shortName: {
          type: String,
          required: true,
          unique: true,
          trim: true,
     },
     code: {
          type: String,
          required: true,
          unique: true,
          trim: true,
     },
     isServiceable: {
          type: Boolean,
          default: true,
     },
}, { timestamps: true });

export default mongoose.models.State || mongoose.model('State', StateSchema);
