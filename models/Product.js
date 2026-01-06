
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot range more than 100 characters']
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, 'Please select a category']
    },

    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    history: {
      type: String,   // textarea (story / origin / brand narrative)
      maxlength: [2000, 'History cannot exceed 2000 characters']
    },

    fermentation: {
      type: {
        type: String,
        enum: {
          values: ["lactic", "acetic", "alcoholic", "fungal", "wild", "symbiotic"],
          message: '{VALUE} is not a supported fermentation type'
        }
      },
      durationDays: {
        type: Number,
        min: [0, 'Duration cannot be negative']
      },
      liveCulture: {
        type: Boolean,
        default: true
      },
      alcoholPercentage: {
        type: Number,
        min: [0, 'Alcohol percentage cannot be negative'],
        max: [100, 'Alcohol percentage cannot exceed 100']
      }
    },

    shelfLifeDays: {
      type: Number,
      min: [0, 'Shelf life cannot be negative']
    },

    requiresColdShipping: {
      type: Boolean,
      default: false
    },

    nutrition: {
      type: String   // textarea (ingredients, nutrition facts)
    },

    regulatory: {
      warnings: String,
    },

    isSubscriptionAvailable: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "active", "archived"],
        message: '{VALUE} is not a valid status'
      },
      default: "draft",
      index: true
    },

    images: [
      {
        url: String,
        alt: String
      }
    ],

    productCode: { // Keeping for internal reference if needed, though user didn't explicitly ask to remove it, it might be useful.
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

