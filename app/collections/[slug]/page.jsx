import ViewOneCollection from "@/components/CollectionsComp/ViewOneCollection";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  await dbConnect();
  // Lookup by slug or productCode to match API logic
  const product = await Product.findOne({
    $or: [{ slug: slug }, { productCode: slug }],
    status: 'active'
  }).select('name description images slug');

  if (!product) {
    return {
      title: "Product Not Found | TrueGut",
      description: "The requested product could not be found.",
    };
  }

  // Handle images which might be objects or strings
  const imageUrls = product.images?.map(img => typeof img === 'string' ? img : img.url) || [];

  return {
    title: `${product.name} | TrueGut`,
    description:
      product.description ||
      "Explore our range of organic and fermented products",
    keywords: `Collections | TrueGut | Fermentaa | Organic | Fermented | ${product.name}`,
    openGraph: {
      title: `${product.name} | TrueGut`,
      description:
        product.description ||
        "Explore our range of organic and fermented products",
      url: `https://truegut.in/collections/${slug}`,
      type: "website",
      images: imageUrls.map((url) => ({ url })),
    },
  };
}

import { Suspense } from "react";

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ViewOneCollection />
    </Suspense>
  );
}
