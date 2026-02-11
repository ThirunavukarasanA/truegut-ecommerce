import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param {string} fileBuffer - Base64 encoded image or file path
 * @param {string} folder - Cloudinary folder name (default: 'fermentaa/products')
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export async function uploadToCloudinary(fileBuffer, folder = 'fermentaa/products') {
     try {
          const result = await cloudinary.uploader.upload(fileBuffer, {
               folder: folder,
               resource_type: 'auto',
               transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto:good' }
               ]
          });

          return {
               secure_url: result.secure_url,
               public_id: result.public_id,
          };
     } catch (error) {
          console.error('Cloudinary upload error:', error);
          throw new Error('Failed to upload image to Cloudinary');
     }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteFromCloudinary(publicId) {
     try {
          await cloudinary.uploader.destroy(publicId);
     } catch (error) {
          console.error('Cloudinary delete error:', error);
          throw new Error('Failed to delete image from Cloudinary');
     }
}

export default cloudinary;
