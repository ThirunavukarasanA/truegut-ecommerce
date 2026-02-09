
import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import TempCustomer from "@/models/TempCustomer";
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

export async function GET(req) {
     try {
          await dbConnect();
          const sessionId = await getOrSetSession();

          let tempCustomer = await TempCustomer.findOne({ sessionId });
          // Must return object, not null, to avoid client errors if accessing properties
          if (!tempCustomer) tempCustomer = {};

          const responseData = {
               success: true,
               ... (tempCustomer.toObject ? tempCustomer.toObject() : tempCustomer)
          };

          return NextResponse.json(responseData);

     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          await dbConnect();
          const sessionId = await getOrSetSession();

          // Read body
          const body = await req.json();
          // Decryption disabled temporarily
          const payload = body;

          const { location, ...personalDetails } = payload;

          let tempCustomer = await TempCustomer.findOne({ sessionId });

          if (!tempCustomer) {
               tempCustomer = new TempCustomer({ sessionId });
          }

          // Update fields if provided
          if (location) {
               tempCustomer.location = { ...tempCustomer.location, ...location };
          }

          if (personalDetails) {
               // Merge top-level fields
               if (personalDetails.firstName) tempCustomer.firstName = personalDetails.firstName;
               if (personalDetails.lastName) tempCustomer.lastName = personalDetails.lastName;
               if (personalDetails.email) tempCustomer.email = personalDetails.email;
               if (personalDetails.phone) tempCustomer.phone = personalDetails.phone;

               if (personalDetails.address) {
                    tempCustomer.address = { ...tempCustomer.address, ...personalDetails.address };
               }
          }

          await tempCustomer.save();

          // Encrypt Full Response disabled temporarily
          const responseData = {
               success: true,
               ... (tempCustomer.toObject ? tempCustomer.toObject() : tempCustomer)
          };

          return NextResponse.json(responseData);

     } catch (error) {
          console.error("TempCustomer POST Error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
