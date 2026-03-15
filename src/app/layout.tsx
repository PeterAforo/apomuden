import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import KwasiChatbot from "@/components/chatbot/KwasiChatbot";
import { PWAUpdateBanner, PWAInstallButton, NetworkStatusBanner } from "@/components/pwa";
import { HealthAlertProvider } from "@/components/alerts";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { VoiceCommandButton } from "@/components/voice";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Apomuden - Ghana's National Digital Health Platform",
    template: "%s | Apomuden",
  },
  description:
    "Discover healthcare facilities, compare services and pricing, request emergency services, and receive health alerts across Ghana. Find hospitals, clinics, pharmacies near you.",
  keywords: [
    "Ghana health",
    "healthcare Ghana",
    "hospitals Ghana",
    "clinics Accra",
    "clinics Tema",
    "NHIS Ghana",
    "emergency services Ghana",
    "health alerts",
    "Ministry of Health Ghana",
    "find hospital near me",
    "Ghana healthcare facilities",
    "medical services Ghana",
    "ambulance Ghana",
    "pharmacy Ghana",
    "symptom checker",
    "health portal Ghana",
  ],
  authors: [{ name: "Ghana Ministry of Health" }],
  creator: "Ghana Health Service",
  publisher: "Ministry of Health, Ghana",
  applicationName: "Apomuden",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Apomuden",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://apomuden.vercel.app",
    siteName: "Apomuden",
    title: "Apomuden - Your Health, Closer",
    description:
      "Ghana's National Digital Health Platform. Find healthcare facilities, check symptoms, request emergency services, and stay informed with health alerts.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Apomuden - Ghana Health Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apomuden - Ghana's National Digital Health Platform",
    description:
      "Find healthcare facilities, check symptoms, and receive health alerts across Ghana.",
    images: ["/og-image.png"],
    creator: "@GhsOfficial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "health",
  alternates: {
    canonical: "https://apomuden.vercel.app",
    languages: {
      "en-GH": "https://apomuden.vercel.app",
      "tw": "https://apomuden.vercel.app/tw",
      "ga": "https://apomuden.vercel.app/ga",
      "ee": "https://apomuden.vercel.app/ee",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#059669" />
      </head>
      <body className={inter.className}>
        <Providers>
          <LanguageProvider>
            <HealthAlertProvider>
              <PWAUpdateBanner />
              <NetworkStatusBanner />
              {children}
              <Toaster />
              <KwasiChatbot />
              <VoiceCommandButton />
              <PWAInstallButton />
            </HealthAlertProvider>
          </LanguageProvider>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registered:', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
