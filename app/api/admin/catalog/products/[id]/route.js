import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(req, { params }) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     const { id } = await params;
     await dbConnect();

     try {
          const product = await Product.findById(id).populate('category');
          if (!product) {
               return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
          }
          return NextResponse.json({ success: true, data: product });
     } catch (error) {
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
               price: parseFloat(getValue('price')),
               stock: parseInt(getValue('stock') || '0'),
               openingStock: parseInt(getValue('openingStock') || '0'),
               status: getValue('status'),
               description: getValue('description'),
               fermentationType: getValue('fermentationType'),
               fermentationDuration: getValue('fermentationDuration'),
               shelfLife: getValue('shelfLife')
          };

          if (body.price !== undefined && body.price < 0) {
               return NextResponse.json({ success: false, error: 'Price cannot be negative' }, { status: 400 });
          }

          if (body.category) {
               // Verify category exists
               const catExists = await Category.findById(body.category);
               if (!catExists) {
                    return NextResponse.json({ success: false, error: 'Selected category does not exist' }, { status: 400 });
               }
          }

          // Handle Images
          // 1. Get Existing
          const existingImages = formData.getAll('existingImages') || [];

          // 2. Upload New
          const newImages = formData.getAll('newImages');
          const newUploadedUrls = [];
          if (newImages && newImages.length > 0) {
               for (const file of newImages) {
                    if (file instanceof File) {
                         const bytes = await file.arrayBuffer();
                         const buffer = Buffer.from(bytes);
                         const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
                         const result = await uploadToCloudinary(base64);
                         newUploadedUrls.push(result.secure_url);
                    }
               }
          }

          const finalImages = [...existingImages, ...newUploadedUrls];
          body.images = finalImages;

          // 3. Cleanup Deleted Images
          // Fetch current product to see what WAS there
          const currentProduct = await Product.findById(id);
          if (!currentProduct) {
               return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
          }

          const oldImages = currentProduct.images || [];
          const imagesToDelete = oldImages.filter(url => !finalImages.includes(url));

          if (imagesToDelete.length > 0) {
               // Async delete from Cloudinary (don't block response too much, or do block for safety)
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
