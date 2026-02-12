import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Order from "@/models/Order";

export async function POST(req, { params }) {
     try {
          await dbConnect();
          const { id } = await params;
          const body = await req.json();
          const { mode, courierName, courierPhone, trackingId, trackingUrl } = body;

          const order = await Order.findById(id);
          if (!order) {
               return NextResponse.json({ error: "Order not found" }, { status: 404 });
          }

          if (order.status !== "Processing" && order.status !== "Shipped") {
               return NextResponse.json({ error: "Order must be Processing or Shipped to update shipment" }, { status: 400 });
          }

          const deliveryDetails = {
               mode,
               shippedAt: order.deliveryDetails?.shippedAt || new Date(), // Keep original shipped date if updating
          };

          if (mode === "Local") {
               deliveryDetails.courierName = courierName;
               deliveryDetails.courierPhone = courierPhone;
               deliveryDetails.trackingId = trackingId;
               deliveryDetails.trackingUrl = trackingUrl;
          } else if (mode === "Shiprocket") {
               // Placeholder for Shiprocket logic
               // 1. Authenticate with Shiprocket
               // 2. Create Order in Shiprocket
               // 3. Generate AWB
               // 4. Update deliveryDetails with AWB and Shipment ID
          }

          order.deliveryDetails = { ...order.deliveryDetails, ...deliveryDetails };
          const isUpdate = order.status === "Shipped";
          order.status = "Shipped";
          await order.save();

          // Send Shipment Email
          try {
               const { sendEmail } = await import('@/lib/admin/email');
               const { shipmentTemplate } = await import('@/lib/admin/email-templates');

               if (order.customer?.email) {
                    const subject = isUpdate
                         ? `Shipment Updated! #${order._id.toString().slice(-8).toUpperCase()}`
                         : `Order Dispatched! #${order._id.toString().slice(-8).toUpperCase()}`;

                    await sendEmail({
                         to: order.customer.email,
                         subject: subject,
                         html: shipmentTemplate(order)
                    });
               }
          } catch (emailError) {
               console.error("Shipment Email Failed:", emailError);
               // Don't block the response, just log the error
          }

          return NextResponse.json({ success: true, data: order });

     } catch (error) {
          console.error("Ship Order Error:", error);
          return NextResponse.json({ error: "Failed to ship order" }, { status: 500 });
     }
}
