import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
          trim: true,
     },
     slug: {
          type: String,
          unique: true,
          lowercase: true,
     },
     description: String,
     category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
          required: true,
     },
     price: {
          type: Number,
          required: true,
          min: 0,
     },
     stock: {
          type: Number,
          default: 0,
          min: 0,
     },
     openingStock: {
          type: Number,
          default: 0,
          min: 0,
     },
     images: [String], // Array of image URLs
     status: {
          type: String,
          enum: ['Active', 'Draft', 'Out of Stock'],
          default: 'Draft',
     },
     variants: [{
          name: String, // e.g., "Size", "Flavor"
          options: [String] // e.g., ["500ml", "1L"]
     }],
     fermentationType: {
          type: String,
          description: "e.g., Wild, Controlled, Symbiotic"
     },
     fermentationDuration: {
          type: String,
          description: "e.g., 7-14 days"
     },
     shelfLife: {
          type: Number,
          description: "Duration in days"
     },
     productCode: {
          type: String,
          unique: true,
     },
     createdAt: {
          type: Date,
          default: Date.now,
     }
});

// Middleware to auto-generate slug and productCode
ProductSchema.pre('save', async function (next) {
     if (this.isModified('name')) {
          this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
     }

     if (!this.productCode && this.category) {
          try {
               // Load Category Model dynamically to avoid circular dependency issues if any
               const Category = mongoose.models.Category || mongoose.model('Category');
               const categoryDoc = await Category.findById(this.category);

               if (categoryDoc) {
                    const catPrefix = categoryDoc.name.substring(0, 3).toUpperCase();
                    const namePrefix = this.name.substring(0, 3).toUpperCase();
                    const prefix = `${catPrefix}-${namePrefix}`;

                    // Find last product with this prefix
                    // We need to access the Product model itself. `this.constructor` gives us the model.
                    const lastProduct = await this.constructor.findOne({
                         productCode: new RegExp(`^${prefix}-\\d{3}$`)
                    }).sort({ productCode: -1 });

                    let sequence = 1;
                    if (lastProduct && lastProduct.productCode) {
                         const parts = lastProduct.productCode.split('-');
                         const lastSeq = parseInt(parts[parts.length - 1]);
                         if (!isNaN(lastSeq)) sequence = lastSeq + 1;
                    }

                    this.productCode = `${prefix}-${String(sequence).padStart(3, '0')}`;
               }
          } catch (error) {
               console.error("Error auto-generating productCode:", error);
               // Proceed without code or handle error? Mongoose will error on unique constraint if null, 
               // but schema doesn't say required. However, we want it.
               // For now, let's allow it to pass, or fallback.
          }
     }
     next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
