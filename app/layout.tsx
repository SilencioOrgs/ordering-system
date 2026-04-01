import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ToastProvider } from "@/components/shared/Toast";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Ate Ai's Kitchen - Online Food Ordering System",
  description: "Order delicious home-cooked meals online from Ate Ai's Kitchen. Fast delivery, easy ordering, and affordable prices.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Ate Ai's Kitchen",
    description: "Order delicious home-cooked meals online",
    url: "https://ateaikitchen.vercel.app",
    siteName: "Ate Ai's Kitchen",
    images: [
      {
        url: "https://ateaikitchen.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ate Ai's Kitchen",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ate Ai's Kitchen - Online Food Ordering",
    description: "Order delicious home-cooked meals online from Ate Ai's Kitchen",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaOrgData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Ate Ai's Kitchen",
    url: "https://ateaikitchen.vercel.app",
    image: "https://ateaikitchen.vercel.app/og-image.png",
    description: "Order delicious home-cooked meals online from Ate Ai's Kitchen",
    priceRange: "$$",
    servesCuisine: "Filipino",
    serviceType: ["Food Delivery", "Online Ordering"],
    areaServed: "Philippines",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgData) }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
