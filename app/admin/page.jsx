import Admin from "./Admin";
export const metadata = {
  title: {
    default: `Fermentaa | Admin`,
  },
  keywords: "Admin | Fermentaa | Organic | Fermented ",
  description: "Admin panel for Fermentaa",
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
    title: "Fermentaa | Admin",
    description: "Admin panel for Fermentaa",
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
export default function AdminLogin() {
  return <Admin />;
}
