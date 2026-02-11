import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema(
     {
          product: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Product",
               required: true,
               index: true
          },

          variant: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Variant",
               required: true,
               index: true
          },

          batchNo: {
               type: String,
               required: true,
               index: true
          },

          productionDate: Date,

          expiryDate: {
               type: Date,
               required: true,
               index: true
          },

          quantity: {
               type: Number,
               required: true,
               min: 0
          },

          status: {
               type: String,
               enum: ["active", "expired", "recalled"],
               default: "active"
          }
     },
     {
          timestamps: true
     });

export default mongoose.models.Batch ||
     mongoose.model("Batch", BatchSchema);
