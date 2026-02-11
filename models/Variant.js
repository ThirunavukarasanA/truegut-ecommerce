import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
     {
          product: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Product",
               required: true,
               index: true
          },

          name: {
               type: String,
               required: true
          },

          sku: {
               type: String,
               required: true,
               unique: true
          },

          price: {
               type: Number,
               required: true,
               min: 0
          },

          costPrice: {
               type: Number,
               min: 0
          },

          weightGrams: Number,

          isActive: {
               type: Boolean,
               default: true
          }
     },
     {
          timestamps: true
     });

export default mongoose.models.Variant ||
     mongoose.model("Variant", VariantSchema);
