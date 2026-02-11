import mongoose from 'mongoose';

const StateLoadSchema = new mongoose.Schema({
     stateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'State',
          required: true
     },
     state: {
          type: String,
          required: true,
          unique: true
     },
     stateCode: {
          type: String,
          required: true
     },
     status: {
          type: String,
          enum: ['pending', 'running', 'completed', 'failed', 'stopped'],
          default: 'pending'
     },
     progress: {
          type: Number,
          default: 0
     },
     totalPincodes: {
          type: Number,
          default: 0
     },
     processedPincodes: {
          type: Number,
          default: 0
     },
     successCount: {
          type: Number,
          default: 0
     },
     currentPincode: String,
     error: String,
     startedAt: Date,
     finishedAt: Date
}, { timestamps: true });

export default mongoose.models.StateLoad || mongoose.model('StateLoad', StateLoadSchema);
