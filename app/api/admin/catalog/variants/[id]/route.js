import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/admin/db';
import Variant from '@/models/Variant';
// Dynamic imports for reference checks to avoid circular dependency issues if any, though less likely here
import Batch from '@/models/Batch';
import Product from "@/models/Product";
import VendorStock from "@/models/VendorStock";
import RestockRequest from "@/models/RestockRequest";
import Cart from "@/models/Cart";
import TempCart from "@/models/TempCart";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/lib/admin/api-auth";

export async function PATCH(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const body = await req.json();


          // If name is updated, check if we need to regenerate SKU
          if (body.name) {
               const currentVariant = await Variant.findById(id);
               if (currentVariant && currentVariant.name !== body.name) {
                    const product = await Product.findById(currentVariant.product);
                    if (product) {
                         const cleanName = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                         const pSlug = cleanName(product.name).substring(0, 3).toUpperCase();
                         const vSlug = cleanName(body.name).substring(0, 3).toUpperCase();

                         let baseSku = `${pSlug}-${vSlug}-`.toUpperCase();
                         let counter = 1;
                         let newSku = `${baseSku}001`;

                         // Ensure uniqueness
                         while (await Variant.findOne({ sku: newSku, _id: { $ne: id } })) {
                              counter++;
                              const suffix = counter.toString().padStart(3, '0');
                              newSku = `${baseSku}${suffix}`;
                         }
                         body.sku = newSku;
                    }
               }
          }

          // If manually updating SKU (override), check uniqueness
          if (body.sku) {
               const skuExists = await Variant.findOne({ sku: body.sku, _id: { $ne: id } });
               if (skuExists) {
                    return NextResponse.json({ success: false, error: 'SKU already exists' }, { status: 400 });
               }
          }

          const variant = await Variant.findByIdAndUpdate(id, body, { new: true, runValidators: true });
          if (!variant) {
               return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: variant });
     } catch (error) {
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
          // Check for dependencies that block deletion (e.g., existing orders)
          const orderCount = await Order.countDocuments({ 'items.variant': id });
          if (orderCount > 0) {
               return NextResponse.json({ success: false, error: 'Cannot delete variant: Associated orders exist. Please remove variant from orders first.' }, { status: 400 });
          }

          // Cascade delete dependencies (cleanup related documents)
          await Promise.all([
               Batch.deleteMany({ variant: id }),
               VendorStock.deleteMany({ variant: id }),
               RestockRequest.deleteMany({ variant: id }),
               Cart.updateMany({}, { $pull: { items: { variantId: id } } }),
               TempCart.updateMany({}, { $pull: { items: { variantId: id } } })
          ]);

          const variant = await Variant.findByIdAndDelete(id);
          if (!variant) {
               return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, message: 'Variant deleted successfully' });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
