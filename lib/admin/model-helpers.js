import mongoose from 'mongoose';

/**
 * Generates a URL-friendly slug from a string.
 * @param {string} name - The string to slugify.
 * @returns {string} - The generated slug.
 */
export const generateSlug = (name) => {
     if (!name) return '';
     return name
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
};

/**
 * Generates a unique product code based on category and name.
 * @param {string} name - Product name.
 * @param {string} categoryId - Category ID.
 * @param {mongoose.Model} ProductModel - The Product model to check for existing codes.
 * @returns {Promise<string>} - The generated product code.
 */
export const generateProductCode = async (name, categoryId, ProductModel) => {
     try {
          const Category = mongoose.models.Category || mongoose.model('Category');
          const categoryDoc = await Category.findById(categoryId);

          if (categoryDoc) {
               const catPrefix = categoryDoc.name.substring(0, 3).toUpperCase();
               const namePrefix = name.substring(0, 3).toUpperCase();
               const prefix = `${catPrefix}-${namePrefix}`;

               // Find last product with this prefix
               const lastProduct = await ProductModel.findOne({
                    productCode: new RegExp(`^${prefix}-\\d{3}$`)
               }).sort({ productCode: -1 });

               let sequence = 1;
               if (lastProduct && lastProduct.productCode) {
                    const parts = lastProduct.productCode.split('-');
                    const lastSeq = parseInt(parts[parts.length - 1]);
                    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
               }

               return `${prefix}-${String(sequence).padStart(3, '0')}`;
          }
     } catch (error) {
          console.error("Error generating productCode helper:", error);
     }
     return '';
};
