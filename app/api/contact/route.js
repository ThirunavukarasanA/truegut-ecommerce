import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Contact from "@/models/Contact";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Simple backend validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    await dbConnect();

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();

    console.log("Contact Form Submission Saved:", newContact);

    return NextResponse.json(
      { message: "Form submitted successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
