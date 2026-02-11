import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import UserLogin from "@/components/user/UserLogin";
export const metadata = {
  title: {
    default: `TrueGut User Account Login`,
  },
  keywords: "TrueGut | Fermentaa | User Account Login",
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
    title: "TrueGut User Account Login",
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
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <UserLogin />
      <Footer />
    </div>
  );
}
