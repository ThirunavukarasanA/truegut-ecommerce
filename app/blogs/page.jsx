import Blogs from "@/components/Blogs/Blogs";
export const metadata = {
  title: {
    default: `Blogs | TrueGut`,
  },
  keywords: "Blogs | TrueGut | Fermentaa | Organic | Fermented ",
  description: "Explore our range of blogs",
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
    title: "Blogs | TrueGut",
    description: "Explore our range of blogs",
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

export default function page() {
  return (
    <div>
      <Blogs />
    </div>
  );
}
