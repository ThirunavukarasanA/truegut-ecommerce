import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Cart from "@/models/Cart";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function getCustomerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload.sub;
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const customerId = await getCustomerId();
    if (!customerId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let cart = await Cart.findOne({ customerId })
      .populate("items.productId")
      .populate("items.variantId");

    if (cart) {
      const { default: Batch } = await import("@/models/Batch");
      const { default: VendorStock } = await import("@/models/VendorStock");
      const vendorId = req.headers.get("x-vendor-id");

      const itemsWithStock = await Promise.all(
        cart.items.map(async (item) => {
          if (!item.variantId) return item;

          let stock = 0;
          const now = new Date();

          if (vendorId) {
            const vendorStocks = await VendorStock.find({
              vendor: vendorId,
              variant: item.variantId._id,
              quantity: { $gt: 0 }
            }).populate('batch');

            stock = vendorStocks.reduce((sum, vs) => {
              if (vs.batch && vs.batch.expiryDate > now && vs.batch.status === 'active') {
                return sum + vs.quantity;
              }
              return sum;
            }, 0);
          } else {
            const batches = await Batch.find({
              variant: item.variantId._id,
              status: "active",
              expiryDate: { $gt: now },
              quantity: { $gt: 0 },
            });
            stock = batches.reduce((sum, b) => sum + b.quantity, 0);
          }

          const itemObj = item.toObject ? item.toObject() : item;
          return { ...itemObj, stock };
        })
      );
      const cartObj = cart.toObject ? cart.toObject() : cart;
      cartObj.items = itemsWithStock;
      cart = cartObj;
    }

    return NextResponse.json({ success: true, cart: cart || { items: [] } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { productId, variantId, quantity, price, name, image } =
      await req.json();
    await dbConnect();
    const customerId = await getCustomerId();
    if (!customerId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    // Find existing item by Product AND Variant (if variant exists)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    );

    // Stock Validation Logic
    const vendorId = req.headers.get("x-vendor-id");
    const now = new Date();
    let totalAvailable = 0;

    let targetVariantId = variantId;

    // Fallback: If no variantId provided, try to find one from the product's variants
    if (!targetVariantId) {
      const { default: Variant } = await import("@/models/Variant");
      const defaultVariant = await Variant.findOne({
        product: productId,
        isActive: true,
      });
      if (defaultVariant) {
        targetVariantId = defaultVariant._id.toString();
      }
    }

    if (vendorId) {
      const { default: VendorStock } = await import("@/models/VendorStock");
      const vendorStocks = await VendorStock.find({
        vendor: vendorId,
        variant: targetVariantId,
        quantity: { $gt: 0 }
      }).populate('batch');

      totalAvailable = vendorStocks.reduce((sum, vs) => {
        if (vs.batch && vs.batch.expiryDate > now && vs.batch.status === 'active') {
          return sum + vs.quantity;
        }
        return sum;
      }, 0);
    } else {
      const { default: Batch } = await import("@/models/Batch");
      const batches = await Batch.find({
        variant: targetVariantId,
        status: "active",
        expiryDate: { $gt: now },
        quantity: { $gt: 0 },
      });
      totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
    }

    let finalQuantity = quantity || 1;
    // Removed: if (existingItemIndex > -1) { finalQuantity += ... }
    // As per user request: "dont use alert in check time... clicking add to cart automatically increase qty, stop that process"
    // Setting absolute quantity instead.

    if (finalQuantity > totalAvailable) {
      return NextResponse.json(
        {
          error: `Insufficient stock. Available: ${totalAvailable}`,
        },
        { status: 400 }
      );
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = finalQuantity;
    } else {
      cart.items.push({
        productId,
        variantId: targetVariantId || variantId,
        quantity: quantity || 1,
        price,
        name,
        image,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { productId, variantId, quantity } = await req.json();
    await dbConnect();
    const customerId = await getCustomerId();
    if (!customerId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await Cart.findOne({ customerId });
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        if (vId) {
          const vendorId = req.headers.get("x-vendor-id");
          const now = new Date();
          let totalAvailable = 0;

          if (vendorId) {
            const { default: VendorStock } = await import("@/models/VendorStock");
            const vendorStocks = await VendorStock.find({
              vendor: vendorId,
              variant: vId,
              quantity: { $gt: 0 }
            }).populate('batch');

            totalAvailable = vendorStocks.reduce((sum, vs) => {
              if (vs.batch && vs.batch.expiryDate > now && vs.batch.status === 'active') {
                return sum + vs.quantity;
              }
              return sum;
            }, 0);
          } else {
            const { default: Batch } = await import("@/models/Batch");
            const batches = await Batch.find({
              variant: vId,
              status: "active",
              expiryDate: { $gt: now },
              quantity: { $gt: 0 },
            });
            totalAvailable = batches.reduce(
              (sum, b) => sum + b.quantity,
              0
            );
          }

          if (quantity > totalAvailable) {
            return NextResponse.json(
              {
                error: `Insufficient stock. Available: ${totalAvailable}`,
              },
              { status: 400 }
            );
          }
        }
        cart.items[itemIndex].quantity = quantity;
      }
      cart.updatedAt = Date.now();
      await cart.save();
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { productId, variantId } = await req.json();
    await dbConnect();
    const customerId = await getCustomerId();
    if (!customerId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await Cart.findOne({ customerId });
    if (!cart) return NextResponse.json({ success: true });

    if (productId) {
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            (variantId
              ? item.variantId?.toString() === variantId
              : !item.variantId)
          )
      );
      cart.updatedAt = Date.now();
      await cart.save();
    } else {
      await Cart.deleteOne({ customerId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
