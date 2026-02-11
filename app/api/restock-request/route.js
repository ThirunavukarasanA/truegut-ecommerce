import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import RestockRequest from "@/models/RestockRequest";

export async function POST(req) {
     try {
          const { productId, variantId, name, email, phone, pincode, postOffice, vendorId } = await req.json();

          if (!productId || (!email && !phone)) {
               return NextResponse.json({ error: "Product ID and contact info are required" }, { status: 400 });
          }

          await dbConnect();

          // Create a new restock request
          const request = await RestockRequest.create({
               product: productId,
               variant: variantId,
               name: name || "Customer",
               email: email,
               phone: phone,
               pincode,
               postOffice,
               vendor: vendorId,
               status: 'pending'
          });

          return NextResponse.json({ success: true, message: "Restock request submitted successfully", id: request._id });

     } catch (error) {
          console.error("Restock request error:", error);
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
     }
}
