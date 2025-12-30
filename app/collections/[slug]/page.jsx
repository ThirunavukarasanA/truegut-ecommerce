import ViewOneCollection from "@/components/CollectionsComp/ViewOneCollection";
import { PRODUCTS } from "@/data/products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | TrueGut",
      description: "The requested product could not be found.",
    };
  }

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
      url: `https://yourwebsite.com/collections/${slug}`, // Update with actual domain if known, or relative
      type: "website",
      images: product.images ? product.images.map((url) => ({ url })) : [],
    },
  };
}

export default function ProductDetailPage() {
  return <ViewOneCollection />;
}
