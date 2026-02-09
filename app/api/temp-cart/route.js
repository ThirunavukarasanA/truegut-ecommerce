
import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import TempCart from "@/models/TempCart";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "@/lib/encryption";

async function getOrSetSession() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session_id")?.value;
  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set({
      name: "cart_session_id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return sessionId;
}

function getMetadata(req) {
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const ip =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.ip ||
    "127.0.0.1";

  let deviceType = "Desktop";
  if (/mobile/i.test(userAgent)) deviceType = "Mobile";
  else if (/tablet/i.test(userAgent)) deviceType = "Tablet";

  return {
    userAgent,
    deviceType,
    ipAddress: ip,
  };
}

export async function GET(req) {
  try {
    await dbConnect();
    await import("@/models/Product");
    await import("@/models/Variant");

    const sessionId = await getOrSetSession();
    let cart = await TempCart.findOne({ sessionId })
      .populate("items.productId")
      .populate("items.variantId");

    if (cart) {
      const { default: Batch } = await import("@/models/Batch");
      const itemsWithStock = await Promise.all(
        cart.items.map(async (item) => {
          if (!item.variantId) return item;
          const batches = await Batch.find({
            variant: item.variantId._id,
            status: "active",
            expiryDate: { $gt: new Date() },
            quantity: { $gt: 0 },
          });
          const stock = batches.reduce((sum, b) => sum + b.quantity, 0);
          const itemObj = item.toObject ? item.toObject() : item;
          return { ...itemObj, stock };
        })
      );
      const cartObj = cart.toObject ? cart.toObject() : cart;
      cartObj.items = itemsWithStock;
      cart = cartObj;
    }

    const responseData = { success: true, cart: cart || { items: [] } };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const rawBody = await req.json();
    // Decryption disabled temporarily
    const body = rawBody;

    const { productId, variantId, quantity, price, name, image } = body;

    await dbConnect();
    const sessionId = await getOrSetSession();
    const metadata = getMetadata(req);

    const vendorId = req.headers.get("x-vendor-id");
    const location = req.headers.get("x-location");

    if (vendorId) metadata.vendorId = vendorId;
    if (location) metadata.location = location;

    let cart = await TempCart.findOne({ sessionId });
    if (!cart) {
      cart = new TempCart({ sessionId, items: [], metadata });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    );

    let totalAvailable = 0;
    let targetVariantId = variantId;

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

      const now = new Date();
      totalAvailable = vendorStocks.reduce((sum, start) => {
        if (start.batch && start.batch.expiryDate > now && start.batch.status === 'active') {
          return sum + start.quantity;
        }
        return sum;
      }, 0);

    } else if (req.headers.get("x-location")) {
      // Case 2: Non-Serviceable Pincode (Not in DB)
      totalAvailable = 0;
    } else {
      const { default: Batch } = await import("@/models/Batch");
      const batches = await Batch.find({
        variant: targetVariantId,
        status: "active",
        expiryDate: { $gt: new Date() },
        quantity: { $gt: 0 },
      });
      totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
    }

    let finalQuantity = quantity || 1;
    if (existingItemIndex > -1) {
      finalQuantity += cart.items[existingItemIndex].quantity;
    }

    if (finalQuantity > totalAvailable) {
      const errorData = {
        success: false,
        error: `Insufficient stock. Available: ${totalAvailable}`,
        available: totalAvailable,
        allowRestockRequest: true
      };
      return NextResponse.json(errorData, { status: 400 });
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

    cart.metadata = { ...cart.metadata, ...metadata };
    cart.updatedAt = Date.now();
    await cart.save();

    const responseData = { success: true, cart };
    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const rawBody = await req.json();
    // Decryption disabled temporarily
    const body = rawBody;

    const { productId, variantId, quantity } = body;

    await dbConnect();
    const sessionId = await getOrSetSession();

    const vendorId = req.headers.get("x-vendor-id");
    const location = req.headers.get("x-location");

    const cart = await TempCart.findOne({ sessionId });
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    if (vendorId) cart.metadata.vendorId = vendorId;
    if (location) cart.metadata.location = location;

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const item = cart.items[itemIndex];
        const vId = item.variantId || variantId;

        if (vId) {
          let totalAvailable = 0;
          const now = new Date();

          if (vendorId) {
            const { default: VendorStock } = await import("@/models/VendorStock");
            const vendorStocks = await VendorStock.find({
              vendor: vendorId,
              variant: vId,
              quantity: { $gt: 0 }
            }).populate('batch');

            totalAvailable = vendorStocks.reduce((sum, start) => {
              if (start.batch && start.batch.expiryDate > now && start.batch.status === 'active') {
                return sum + start.quantity;
              }
              return sum;
            }, 0);
          } else {
            const { default: Batch } = await import("@/models/Batch");
            const batches = await Batch.find({
              variant: vId,
              status: "active",
              expiryDate: { $gt: new Date() },
              quantity: { $gt: 0 },
            });
            totalAvailable = batches.reduce(
              (sum, b) => sum + b.quantity,
              0
            );
          }

          if (quantity > totalAvailable) {
            const errorData = {
              success: false,
              error: `Insufficient stock. Available: ${totalAvailable}`,
              available: totalAvailable,
              allowRestockRequest: true
            };
            return NextResponse.json(errorData, { status: 400 });
          }
        }
        cart.items[itemIndex].quantity = quantity;
      }
      cart.updatedAt = Date.now();
      await cart.save();
    }

    const responseData = { success: true, cart };
    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body is fine for clearing entire cart
    }

    const { productId, variantId } = body;

    await dbConnect();
    const sessionId = await getOrSetSession();

    const cart = await TempCart.findOne({ sessionId });
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
      await TempCart.deleteOne({ sessionId });
    }

    const responseData = { success: true };
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
