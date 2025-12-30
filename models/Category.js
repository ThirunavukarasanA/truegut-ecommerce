import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
          unique: true,
          trim: true,
     },
     slug: {
          type: String,
          unique: true,
          lowercase: true,
     },
     description: String,
     image: String, // URL
     isActive: {
          type: Boolean,
          default: true,
     },
     createdAt: {
          type: Date,
          default: Date.now,
     }
});

// Middleware to auto-generate slug from name
CategorySchema.pre('save', async function () {
     if (this.isModified('name')) {
          this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
     }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
