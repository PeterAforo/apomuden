import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import KwasiChatbot from "@/components/chatbot/KwasiChatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Apomuden - Ghana's National Digital Health Platform",
    template: "%s | Apomuden",
  },
  description:
    "Discover healthcare facilities, compare services and pricing, request emergency services, and receive health alerts across Ghana.",
  keywords: [
    "Ghana health",
    "healthcare",
    "hospitals Ghana",
    "clinics",
    "NHIS",
    "emergency services",
    "health alerts",
    "Ministry of Health Ghana",
  ],
  authors: [{ name: "Ghana Ministry of Health" }],
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://apomuden.gov.gh",
    siteName: "Apomuden",
    title: "Apomuden - Your Health, Closer",
    description:
      "Ghana's National Digital Health Platform for facility discovery, emergency services, and health alerts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apomuden - Ghana's National Digital Health Platform",
    description:
      "Discover healthcare facilities, compare services, and receive health alerts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <KwasiChatbot />
        </Providers>
      </body>
    </html>
  );
}
