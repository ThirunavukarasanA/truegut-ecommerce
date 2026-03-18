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
  metadataBase: new URL("https://www.truegut.in"),
  openGraph: {
    title: "TrueGut",
    description: "Explore our range of organic and fermented products",
    url: "https://www.truegut.in/",
    siteName: "TrueGut",
    images: [
      {
        url: "/logos/truegut_icon.png",
        width: 800,
        height: 600,
        alt: "TrueGut | Fermentaa | Organic | Fermented | Collections",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};
export default function Home() {
  return <HomeComponent />;
}
