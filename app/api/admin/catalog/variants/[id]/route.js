import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Variant from '@/models/Variant';
// Dynamic imports for reference checks to avoid circular dependency issues if any, though less likely here
import Batch from '@/models/Batch';
import Order from '@/models/Order';
import { getAuthenticatedUser } from '@/lib/api-auth';

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

          // If updating SKU, check uniqueness
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
          // Check for dependencies
          const batchCount = await Batch.countDocuments({ variant: id });
          if (batchCount > 0) {
               return NextResponse.json({ success: false, error: 'Cannot delete variant: Associated batches exist.' }, { status: 400 });
          }

          const orderCount = await Order.countDocuments({ 'items.variant': id });
          if (orderCount > 0) {
               return NextResponse.json({ success: false, error: 'Cannot delete variant: Associated orders exist.' }, { status: 400 });
          }

          const variant = await Variant.findByIdAndDelete(id);
          if (!variant) {
               return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, message: 'Variant deleted successfully' });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
