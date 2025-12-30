import Contact from "@/components/ContactComp/Contact";
export const metadata = {
  title: {
    default: `Contact | TrueGut`,
  },
  keywords: "Contact | TrueGut | Fermentaa | Organic | Fermented ",
  description: "Contact TrueGut",
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
    title: "Contact | TrueGut",
    description: "Contact TrueGut",
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
      <Contact />
    </div>
  );
}
