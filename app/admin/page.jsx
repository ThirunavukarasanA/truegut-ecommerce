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

          locale: "en_US",
          type: "website",
     },
     // metadataBase: new URL(``),
     alternates: {
          canonical: "",
     },
};

export default AdminLogin;
