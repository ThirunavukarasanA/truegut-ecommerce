import Collections from "@/components/CollectionsComp/collections";
export const metadata = {
  title: {
    default: `TrueGut | Collections`,
  },
  keywords: "Collections | TrueGut | Fermentaa | Organic | Fermented ",
  description: "Explore our range of organic and fermented products",
  icons: {
    icon: "../favicon.ico",
    shortcut: "../favicon.ico",
    apple: "../favicon.ico",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "../favicon.ico",
    },
  },
  openGraph: {
    title: "TrueGut | Collections",
    description: "Explore our range of organic and fermented products",
    url: "",
    siteName: "",
    // images: [
    //   {
    //     url: "https://makecomponents.com/Image/footer/footer002.webp", // Must be an absolute URL
    //     width: 800,
    //     height: 600,
    //     alt: "foote components",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
  // metadataBase: new URL(``),
  alternates: {
    canonical: "",
  },
};

export default function CollectionsPage() {
  return <Collections />;
}
