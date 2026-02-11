import mongoose from 'mongoose';

const PincodeSchema = new mongoose.Schema({
     stateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'State',
     },
     state: {
          type: String,
          required: true,
     },
     stateCode: String,
     district: String,
     pincode: String,
     isServiceable: {
          type: Boolean,
          default: true,
     },
     active: {
          type: Boolean,
          default: true
     },
     assignedToVendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor'
     },
     // Rich data from External API
     postOffices: [{
          name: String,
          branchType: String,
          deliveryStatus: String,
          circle: String,
          district: String,
          division: String,
          region: String,
          block: String,
          state: String,
          country: String,
          pincode: String,
     }]
}, { timestamps: true });

export default mongoose.models.Pincode || mongoose.model('Pincode', PincodeSchema);
