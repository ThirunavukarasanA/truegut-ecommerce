import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';
import { generateProductCode, generateSlug } from '@/lib/model-helpers';

export async function GET(req, { params }) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     const { id } = await params;
     await dbConnect();

     try {
          console.log("Fetching product:", id);
          const product = await Product.findById(id).populate('category');
          if (!product) {
               console.log("Product not found");
               return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
          }
          console.log("Product found:", product._id);

          // Check if product has orders
          console.log("Checking orders...");
          const Order = mongoose.models.Order || (await import('@/models/Order')).default;
          const orderCount = await Order.countDocuments({ 'items.product': id });
          console.log("Order count:", orderCount);

          const productData = product.toObject();
          productData.hasOrders = orderCount > 0;

          return NextResponse.json({ success: true, data: productData });
     } catch (error) {
          console.error("GET Product Error Stack:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function PATCH(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const formData = await req.formData();

          // Helper to get form value
          const getValue = (key) => {
               const val = formData.get(key);
               if (val === 'null' || val === 'undefined') return undefined;
               return val;
          };

          const body = {
               name: getValue('name'),
               category: getValue('category'),
               // price: REMOVED
               // stock: REMOVED
               // openingStock: REMOVED
               status: getValue('status'),
               description: getValue('description'),
               history: getValue('history'),
               shelfLifeDays: getValue('shelfLifeDays') ? parseInt(getValue('shelfLifeDays')) : undefined,
               requiresColdShipping: getValue('requiresColdShipping') !== undefined ? getValue('requiresColdShipping') === 'true' : undefined,
               nutrition: getValue('nutrition'),
               iframeVideo: getValue('iframeVideo'), // Assuming this might be kept or removed? User didn't specify removal but not in new schema explicitly. Removing safe.
               isSubscriptionAvailable: getValue('isSubscriptionAvailable') !== undefined ? getValue('isSubscriptionAvailable') === 'true' : undefined,

               slug: getValue('name') ? generateSlug(getValue('name')) : undefined
          };

          // Nested updates are tricky with mongoose findByIdAndUpdate flat body, so we construct keys explicitly for nested or direct replacement
          // A safer update strategy for nested objects if partial update is needed:
          // But here we might be sending full forms. Let's assume full update for nested objects for simplicity or handle keys.
          // Or better, use specific keys like 'fermentation.type' in update if we want granular, but usually form sends all.

          const fermentation = {
               type: getValue('fermentation.type'),
               durationDays: getValue('fermentation.durationDays') ? parseInt(getValue('fermentation.durationDays')) : undefined,
               liveCulture: getValue('fermentation.liveCulture') === 'true',
               alcoholPercentage: getValue('fermentation.alcoholPercentage') ? parseFloat(getValue('fermentation.alcoholPercentage')) : undefined
          };

          // Only add to body if at least one field is present (to avoid overwriting with empty object if not sent)
          if (fermentation.type !== undefined || fermentation.durationDays !== undefined) {
               body.fermentation = fermentation;
          }

          const regulatory = {
               warnings: getValue('regulatory.warnings'),
          };

          if (regulatory.warnings !== undefined) {
               body.regulatory = regulatory;
          }

          if (body.category) {
               // Verify category exists
               const catExists = await Category.findById(body.category);
               if (!catExists) {
                    return NextResponse.json({ success: false, error: 'Selected category does not exist' }, { status: 400 });
               }
          }

          // Handle Images
          // 1. Get Existing - Parsing because they come as JSON strings or individual fields if simpler?
          // Usually existingImages are just URLs.
          // BUT new schema is object array {url, alt}.
          // Let's assume frontend sends `existingImages` as json string of objects OR we parse differently.
          // For simplicity in this transition, let's assume `existingImages` contains URLs to KEEP.
          // We will map them to the new structure if they aren't already.

          // NOTE: The previous frontend sent URLs for existing images.
          // We need to fetch the CURRENT product to preserve alt tags if we want, or just rebuild.

          const currentProduct = await Product.findById(id);
          if (!currentProduct) {
               return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
          }

          const existingImagesData = [];
          const existingImagesKeys = formData.getAll('existingImages'); // URLs

          // Rebuild existing images structure
          // If we had alt text before, we might lose it if we just look at URL. 
          // But previous schema was just [String]. So we define default alt.
          existingImagesKeys.forEach(url => {
               existingImagesData.push({
                    url: url,
                    alt: body.name || currentProduct.name // Default alt
               });
          });


          // 2. Upload New
          const newImages = formData.getAll('newImages');
          const newUploadedImages = [];
          if (newImages && newImages.length > 0) {
               for (const file of newImages) {
                    if (file instanceof File) {
                         const bytes = await file.arrayBuffer();
                         const buffer = Buffer.from(bytes);
                         const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
                         const result = await uploadToCloudinary(base64);
                         newUploadedImages.push({
                              url: result.secure_url,
                              alt: body.name || currentProduct.name
                         });
                    }
               }
          }

          const finalImages = [...existingImagesData, ...newUploadedImages];
          body.images = finalImages;

          // 3. Cleanup Deleted Images
          // Find URLs in currentProduct that are NOT in finalImages
          const finalUrls = finalImages.map(img => img.url);
          const oldImagesInfo = currentProduct.images || [];
          // New schema `images` is array of objects. Old schema was [String], OR if we already ran migration it's objects.
          // Safe check: handle both.
          const oldUrls = oldImagesInfo.map(img => (typeof img === 'string' ? img : img.url));

          const imagesToDelete = oldUrls.filter(url => !finalUrls.includes(url));

          if (imagesToDelete.length > 0) {
               await Promise.all(imagesToDelete.map(async (url) => {
                    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
                    const match = url.match(regex);
                    if (match) {
                         try {
                              await deleteFromCloudinary(match[1]);
                         } catch (err) {
                              console.error(`Failed to delete image ${url}:`, err);
                         }
                    }
               }));
          }

          // Handle productCode if name or category changed and code is missing
          if (!currentProduct.productCode || body.name || body.category) {
               const productName = body.name || currentProduct.name;
               const categoryId = body.category || currentProduct.category;
               if (!currentProduct.productCode) {
                    body.productCode = await generateProductCode(productName, categoryId, Product);
               }
          }

          const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });

          return NextResponse.json({ success: true, data: product });
     } catch (error) {
          console.error("Update Product Error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}

export async function DELETE(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const product = await Product.findById(id);
          if (!product) {
               return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
          }

          // Check if product exists in any orders
          const Order = mongoose.models.Order || (await import('@/models/Order')).default;
          const orderExists = await Order.findOne({ 'items.product': id });
          if (orderExists) {
               return NextResponse.json({
                    success: false,
                    error: 'Cannot delete product. It is referenced in existing orders.'
               }, { status: 400 });
          }

          // Delete images from Cloudinary
          if (product.images && product.images.length > 0) {
               await Promise.all(product.images.map(async (url) => {
                    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
                    const match = url.match(regex);
                    if (match) {
                         try {
                              await deleteFromCloudinary(match[1]);
                         } catch (err) {
                              console.error(`Failed to delete image ${url}:`, err);
                         }
                    }
               }));
          }

          await Product.findByIdAndDelete(id);

          return NextResponse.json({ success: true, message: 'Product deleted successfully' });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
