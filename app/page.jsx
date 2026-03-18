import HomeComponent from "@/components/Home/HomeComponent";
export const metadata = {
  title: {
    default: `TrueGut`,
  },
  keywords: "TrueGut | Fermentaa | Organic | Fermented | Collections",
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
    title: "TrueGut",
    description: "Explore our range of organic and fermented products",
    url: "https://www.truegut.in/",
    siteName: "TrueGut",
    images: [
      {
        url: "/favicon-32x32.png", // Must be an absolute URL
        width: 800,
        height: 600,
        alt: "foote components",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // metadataBase: new URL(``),
  alternates: {
    canonical: "",
  },
};
export default function Home() {
  return <HomeComponent />;
}
