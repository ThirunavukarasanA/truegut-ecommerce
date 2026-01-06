import AdminLogin from "./AdminLogin";

export const metadata = {
     title: {
          default: `TrueGut | Admin`,
     },
     keywords: "Admin | TrueGut | Organic | Fermented ",
     description: "Admin panel for TrueGut",
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
          title: "TrueGut | Admin",
          description: "Admin panel for TrueGut",
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

export default AdminLogin;
