import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Order from "@/models/Order";

// ─── Shiprocket Helpers ──────────────────────────────────────────────────────

async function shiprocketAuth() {
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    },
  );
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || "Shiprocket authentication failed");
  }
  return data.token;
}

async function createShiprocketOrder(token, order, packageDetails) {
  const addr = order.customer?.address || {};
  const orderDate = new Date(order.createdAt).toISOString().split("T")[0];

  // Build order items for Shiprocket
  const orderItems = order.items.map((item, i) => ({
    name: item.productSnapshot?.name || `Item ${i + 1}`,
    sku: item.productSnapshot?.sku || `SKU-${i + 1}`,
    units: item.quantity,
    selling_price: item.price,
  }));

  const payload = {
    order_id: `TG-${order._id.toString().slice(-8).toUpperCase()}`,
    order_date: orderDate,
    pickup_location: packageDetails.pickupLocation || "Primary",
    channel_id: "",
    comment: "TrueGut eCommerce Order",
    billing_customer_name: order.customer?.name || "Customer",
    billing_last_name: "",
    billing_address: addr.street || "N/A",
    billing_city: addr.city || "N/A",
    billing_pincode: addr.pincode || "000000",
    billing_state: addr.state || "N/A",
    billing_country: "India",
    billing_email: order.customer?.email || "",
    billing_phone: order.customer?.phone || "0000000000",
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.paymentDetails?.method === "COD" ? "COD" : "Prepaid",
    sub_total: order.totalAmount,
    length: parseFloat(packageDetails.length) || 10,
    breadth: parseFloat(packageDetails.breadth) || 10,
    height: parseFloat(packageDetails.height) || 10,
    weight: parseFloat(packageDetails.weight),
  };

  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create Shiprocket order");
  }
  return data; // { order_id, shipment_id, status, ... }
}

async function generateAWB(token, shipmentId) {
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: shipmentId }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to generate AWB");
  }
  // data.response.data.awb_code, courier_name
  return data?.response?.data || {};
}

async function schedulePickup(token, shipmentId) {
  const today = new Date();
  const pickupDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [shipmentId],
        pickup_date: [pickupDate],
      }),
    },
  );
  const data = await res.json();
  // pickup scheduling may fail if same-day — we continue without blocking
  return data;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const {
      mode,
      courierName,
      courierPhone,
      trackingId,
      trackingUrl,
      weight,
      length,
      breadth,
      height,
      pickupLocation,
    } = body;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "Processing" && order.status !== "Shipped") {
      return NextResponse.json(
        { error: "Order must be Processing or Shipped to update shipment" },
        { status: 400 },
      );
    }

    const deliveryDetails = {
      mode,
      shippedAt: order.deliveryDetails?.shippedAt || new Date(),
    };

    if (mode === "Local") {
      deliveryDetails.courierName = courierName;
      deliveryDetails.courierPhone = courierPhone;
      deliveryDetails.trackingId = trackingId;
      deliveryDetails.trackingUrl = trackingUrl;
    } else if (mode === "Shiprocket") {
      if (!weight) {
        return NextResponse.json(
          { error: "Package weight is required for Shiprocket" },
          { status: 400 },
        );
      }

      // 1. Authenticate
      const token = await shiprocketAuth();

      // 2. Create Shiprocket Order
      const srOrder = await createShiprocketOrder(token, order, {
        weight,
        length,
        breadth,
        height,
        pickupLocation,
      });
      const shipmentId = srOrder.shipment_id;

      // 3. Generate AWB (courier assignment)
      const awbData = await generateAWB(token, shipmentId);
      const awbCode = awbData.awb_code || "";
      const assignedCourier = awbData.courier_name || "Shiprocket Partner";

      // 4. Schedule Pickup (best-effort — errors are non-blocking)
      try {
        await schedulePickup(token, shipmentId);
      } catch (pickupErr) {
        console.warn("Pickup scheduling warning:", pickupErr.message);
      }

      // 5. Store Shiprocket details
      deliveryDetails.shiprocketOrderId = srOrder.order_id?.toString();
      deliveryDetails.shiprocketShipmentId = shipmentId?.toString();
      deliveryDetails.awbCode = awbCode;
      deliveryDetails.courierName = assignedCourier;
      deliveryDetails.trackingId = awbCode;
      deliveryDetails.trackingUrl = awbCode
        ? `https://shiprocket.co/tracking/${awbCode}`
        : "";
      deliveryDetails.weight = weight;
      deliveryDetails.length = length;
      deliveryDetails.breadth = breadth;
      deliveryDetails.height = height;
      deliveryDetails.pickupLocation = pickupLocation;
    }

    order.deliveryDetails = { ...order.deliveryDetails, ...deliveryDetails };
    const isUpdate = order.status === "Shipped";
    order.status = "Shipped";
    await order.save();

    // Send Shipment Email
    try {
      const { sendEmail } = await import("@/lib/admin/email");
      const { shipmentTemplate } = await import("@/lib/admin/email-templates");

      if (order.customer?.email) {
        const subject = isUpdate
          ? `Shipment Updated! #${order._id.toString().slice(-8).toUpperCase()}`
          : `Order Dispatched! #${order._id.toString().slice(-8).toUpperCase()}`;

        await sendEmail({
          to: order.customer.email,
          subject: subject,
          html: shipmentTemplate(order),
        });
      }
    } catch (emailError) {
      console.error("Shipment Email Failed:", emailError);
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Ship Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to ship order" },
      { status: 500 },
    );
  }
}
