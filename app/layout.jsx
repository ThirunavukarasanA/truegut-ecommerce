import { Toaster } from "react-hot-toast";
import { Poppins } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import WhatsAppButton from "../components/Common/WhatsAppButton";

export const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});
// export const metadata = {
//   title: "Fermentaa - Admin Panel",
//   description: "E-commerce administrative interface",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#333",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                padding: "12px 16px",
              },
            }}
          />
        </Providers>
        <WhatsAppButton />
      </body>
    </html>
  );
}
