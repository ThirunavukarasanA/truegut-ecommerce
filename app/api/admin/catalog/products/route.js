import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category'; // Ensure model is compiled
import { getAuthenticatedUser } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const category = searchParams.get('category');
          const search = searchParams.get('search');
          const status = searchParams.get('status');

          let query = {};

          if (category && category !== 'All') {
               // query.category = category; // If category ID is passed
          }

          if (status && status !== 'All') {
               query.status = status;
          }

          if (search) {
               query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { fermentationType: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
               ];
          }

          const products = await Product.find(query)
               .populate('category', 'name')
               .sort('-createdAt');

          return NextResponse.json({ success: true, data: products });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     const user = await getAuthenticatedUser();
     // Only admin/system_admin/owner can create
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

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

          // Validation
          if (!body.name || !body.category || isNaN(body.price)) {
               return NextResponse.json({ success: false, error: 'Name, Category, and Price are required' }, { status: 400 });
          }

          if (body.price < 0) {
               return NextResponse.json({ success: false, error: 'Price cannot be negative' }, { status: 400 });
          }

          // Real-time Scenario: Verify category exists
          const catExists = await Category.findById(body.category);
          if (!catExists) {
               return NextResponse.json({ success: false, error: 'Selected category does not exist' }, { status: 400 });
          }

          // Handle Image Uploads
          const newImages = formData.getAll('newImages'); // Returns array of File objects
          const imageUrls = [];

          if (newImages && newImages.length > 0) {
               for (const file of newImages) {
                    if (file instanceof File) {
                         const bytes = await file.arrayBuffer();
                         const buffer = Buffer.from(bytes);
                         const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
                         const result = await uploadToCloudinary(base64);
                         imageUrls.push(result.secure_url);
                    }
               }
          }

          body.images = imageUrls;

          const product = await Product.create(body);
          return NextResponse.json({ success: true, data: product });
     } catch (error) {
          console.error("Create Product Error:", error);
          if (error.name === 'CastError') {
               return NextResponse.json({ success: false, error: 'Invalid Category ID format' }, { status: 400 });
          }
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}
