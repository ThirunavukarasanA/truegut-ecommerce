
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import Pincode from '@/models/Pincode';
import VendorStock from '@/models/VendorStock';
import Batch from '@/models/Batch';
import { encrypt, decrypt } from '@/lib/encryption';

export async function POST(req) {
     try {
          await dbConnect();

          // Decrypt Request
          const rawBody = await req.json();
          // Decryption disabled temporarily
          const body = rawBody;

          const { items, location } = body; // items: [{ product, variant, quantity, price }], location: { pincode }

          if (!items || !Array.isArray(items) || items.length === 0) {
               return NextResponse.json({ success: false, error: 'No items to validate' }, { status: 400 });
          }

          const errors = [];
          const warnings = [];
          let subtotal = 0;

          // 1. Determine Vendor
          let assignedVendorId = null;
          if (location?.pincode) {
               const pincodeDoc = await Pincode.findOne({ pincode: location.pincode, isServiceable: true });
               if (pincodeDoc?.assignedToVendor) {
                    assignedVendorId = pincodeDoc.assignedToVendor;
               }
          }

          // 2. Validate Items
          for (const item of items) {
               const { product: productId, variant: variantId, quantity, price: clientPrice } = item;

               // Fetch Product & Variant
               const variant = await Variant.findById(variantId).populate('product');

               if (!variant) {
                    errors.push(`Variant for item ${item.name || 'unknown'} not found.`);
                    continue;
               }
               if (!variant.product) {
                    errors.push(`Product for variant ${variant.name} not found.`);
                    continue;
               }
               // Ensure we are checking the correct product if passed
               if (productId && variant.product._id.toString() !== productId) {
                    // mismtach, but maybe not critical if variant is unique. Let's warn.
               }

               const product = variant.product;

               // Check Status
               if (product.status === 'archived' || !variant.isActive) {
                    errors.push(`Product "${product.name} - ${variant.name}" is no longer available.`);
                    continue;
               }

               // Check Price
               if (variant.price !== clientPrice) {
                    errors.push(`Price for "${product.name} - ${variant.name}" has changed from ₹${clientPrice} to ₹${variant.price}. Please refresh cart.`);
                    // We treat price mismatches as errors to prevent users from being charged a different amount than expected
                    continue;
               }
               subtotal += variant.price * quantity;

               // Check Stock
               if (assignedVendorId) {
                    // Case 1: Serviceable Pincode (Vendor Mapped)
                    const totalVendorStock = await VendorStock.aggregate([
                         { $match: { vendor: assignedVendorId, variant: variant._id } },
                         { $group: { _id: null, total: { $sum: "$quantity" } } }
                    ]);
                    const available = totalVendorStock[0]?.total || 0;

                    if (available < quantity) {
                         errors.push(`Insufficient stock for "${product.name} - ${variant.name}" (Available: ${available}).`);
                    }
               } else if (location?.pincode) {
                    // Case 2: Non-Serviceable Pincode (Not in DB)
                    // Explicitly return 0 stock / serviceable error
                    errors.push(`Sorry, we do not currently service the pincode ${location.pincode}. Please request a restock.`);
               } else {
                    // Case 3: No location context (should rarely happen at checkout)
                    const totalBatchStock = await Batch.aggregate([
                         {
                              $match: {
                                   variant: variant._id,
                                   status: 'active',
                                   expiryDate: { $gt: new Date() }
                              }
                         },
                         { $group: { _id: null, total: { $sum: "$quantity" } } }
                    ]);
                    const available = totalBatchStock[0]?.total || 0;

                    if (available < quantity) {
                         errors.push(`Insufficient stock for "${product.name} - ${variant.name}" (Available: ${available}).`);
                    }
               }
          }

          if (errors.length > 0) {
               // Encrypt Full Response
               const responseData = {
                    success: false,
                    isValid: false,
                    errors,
                    warnings
               };
               return NextResponse.json(responseData);
          }

          // Encrypt Full Response
          const responseData = {
               success: true,
               isValid: true,
               warnings,
               subtotal
          };
          return NextResponse.json(responseData);

     } catch (error) {
          console.error("Checkout Validation Error:", error);
          // Return clear error (maybe not encrypted if status 500?)
          // Client expects encryptedData usually for success.
          // secureFetch returns response.json() if no encryptedData.
          return NextResponse.json({
               success: false,
               error: error.message
          }, { status: 500 });
     }
}
