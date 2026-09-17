import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "QET Kultur-Kompass — Die 12-Monats-Kulturreise",
  description:
    "Begleit-Dashboard zur QET-Masterclass: misst den Status quo der Unternehmenskultur in 60 Kriterien (Qualität, Ethik, Transparenz) und begleitet Firmen als 12-monatige Kulturreise.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QET Kompass",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d1d1f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
