import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Pincode from "@/models/Pincode";
import Vendor from "@/models/Vendor";

export async function GET(req, { params }) {
     try {
          const { pincode } = await params;

          if (!pincode || pincode.length !== 6) {
               return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
          }

          await dbConnect();

          // Find pincode and populate vendor
          const pincodeData = await Pincode.findOne({ pincode, isServiceable: true })
               .populate("assignedToVendor", "name _id");

          if (!pincodeData) {
               return NextResponse.json({
                    error: "Pincode not serviceable or not found",
                    serviceable: false
               }, { status: 404 });
          }

          return NextResponse.json({
               success: true,
               serviceable: true,
               pincode: pincodeData.pincode,
               district: pincodeData.district,
               state: pincodeData.state,
               postOffices: pincodeData.postOffices.map(po => po.name),
               vendor: pincodeData.assignedToVendor ? {
                    id: pincodeData.assignedToVendor._id,
                    name: pincodeData.assignedToVendor.name
               } : null
          });

     } catch (error) {
          console.error("Location lookup error:", error);
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
     }
}
