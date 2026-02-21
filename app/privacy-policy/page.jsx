import PrivacyPolicy from "@/components/PrivacyPolicy/PrivacyPolicy";

export const metadata = {
  title: {
    default: `Privacy Policy | TrueGut`,
  },
  keywords: "Privacy Policy | TrueGut | Fermentaa | Data Protection",
  description:
    "Read TrueGut's Privacy Policy to understand how we collect, use, and protect your personal information.",
  icons: {
    icon: "../../favicon.ico",
    shortcut: "../../favicon.ico",
    apple: "../../favicon.ico",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "../../favicon.ico",
    },
  },
  openGraph: {
    title: "Privacy Policy | TrueGut",
    description:
      "Read TrueGut's Privacy Policy to understand how we collect, use, and protect your personal information.",
    url: "",
    siteName: "TrueGut",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PrivacyPolicy />
    </div>
  );
}
