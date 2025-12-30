import About from "@/components/AboutComp/About";
export const metadata = {
  title: {
    default: `About | TrueGut`,
  },
  keywords: "About | Fermentaa | Organic | Fermented ",
  description: "About TrueGut",
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
    title: "About | TrueGut",
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

export default function page() {
  return (
    <div>
      <About />
    </div>
  );
}
