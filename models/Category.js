import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
     name: {
          type: String,
          required: [true, 'Please provide a category name'],
          unique: true,
          trim: true,
          maxlength: [50, 'Name cannot be more than 50 characters']
     },
     slug: {
          type: String,
          unique: true,
          lowercase: true,
          index: true
     },
     description: {
          type: String,
          trim: true,
          maxlength: [500, 'Description cannot be more than 500 characters']
     },
     image: {
          type: String, // Keeping as URL string for simplicity in categories
     },
     isActive: {
          type: Boolean,
          default: true,
          index: true
     }
},
     {
          timestamps: true
     });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
