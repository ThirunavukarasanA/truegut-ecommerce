import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Batch from "@/models/Batch";
import Category from "@/models/Category"; // Ensure model is compiled
import { getAuthenticatedUser } from "@/lib/api-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { generateProductCode, generateSlug } from "@/lib/model-helpers";

export async function GET(req) {
  const user = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (status && status !== "All") {
      if (status.toLowerCase() === "out of stock") {
        // Find products that HAVE valid stock (active batch, qty > 0, not expired)
        const validProductIds = await Batch.distinct("product", {
          status: "active",
          quantity: { $gt: 0 },
          expiryDate: { $gt: new Date() },
        });

        // Filter for products NOT in that list
        query._id = { $nin: validProductIds };
        // Optionally, you might want to only show "active" products that are out of stock,
        // but "Out of Stock" usually implies checking the catalog for what's missing.
        // If you want ONLY active products that are out of stock:
        // query.status = 'active';
      } else {
        // Handle "Active", "Draft" - lowercase them to match schema enum
        query.status = status.toLowerCase();
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort("-createdAt");

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const user = await getAuthenticatedUser();
  // Only admin/system_admin/owner can create
  const allowedRoles = ["admin", "system_admin", "owner"];
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin access required" },
      { status: 401 }
    );
  }

  await dbConnect();
  try {
    const formData = await req.formData();

    // Helper to get form value
    const getValue = (key) => {
      const val = formData.get(key);
      if (val === "null" || val === "undefined") return undefined;
      return val;
    };

    const body = {
      name: getValue("name"),
      category: getValue("category"),
      // price: REMOVED
      // stock: REMOVED
      // openingStock: REMOVED
      status: getValue("status") || "draft",
      description: getValue("description"),
      history: getValue("history"), // Added back as per schema
      microbialProfile: getValue("microbialProfile"),
      shelfLifeDays: getValue("shelfLifeDays")
        ? parseInt(getValue("shelfLifeDays"))
        : undefined,
      requiresColdShipping: getValue("requiresColdShipping") === "true",
      nutrition: getValue("nutrition"),
      isSubscriptionAvailable: getValue("isSubscriptionAvailable") === "true",

      // Nested Objects construction
      fermentation: {
        type: getValue("fermentation.type"),
        durationDays: getValue("fermentation.durationDays")
          ? parseInt(getValue("fermentation.durationDays"))
          : undefined,
        liveCulture: getValue("fermentation.liveCulture") === "true",
        alcoholPercentage: getValue("fermentation.alcoholPercentage")
          ? parseFloat(getValue("fermentation.alcoholPercentage"))
          : undefined,
      },
      regulatory: {
        warnings: getValue("regulatory.warnings"),
      },
    };

    // Validation
    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: "Name and Category are required" },
        { status: 400 }
      );
    }

    // Real-time Scenario: Verify category exists
    const catExists = await Category.findById(body.category);
    if (!catExists) {
      return NextResponse.json(
        { success: false, error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    // Handle Image Uploads
    const newImages = formData.getAll("newImages"); // Returns array of File objects
    const images = [];

    if (newImages && newImages.length > 0) {
      for (const file of newImages) {
        if (file instanceof File) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = `data:${file.type};base64,${buffer.toString(
            "base64"
          )}`;
          const result = await uploadToCloudinary(base64);
          images.push({
            url: result.secure_url,
            alt: body.name, // Default alt text
          });
        }
      }
    }

    body.images = images;
    body.slug = generateSlug(body.name);
    body.productCode = await generateProductCode(
      body.name,
      body.category,
      Product
    );

    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Create Product Error:", error);
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid Category ID format" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
