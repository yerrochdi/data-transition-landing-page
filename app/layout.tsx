import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const SITE_URL = "https://nextmove.sh";
const SITE_NAME = "NextMove AI";
const SITE_DESCRIPTION =
  "Votre coach IA pour réussir votre transition vers un métier de la data. Parcours personnalisé, opportunités, copilot intelligent.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Votre coach IA pour la transition data`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "reconversion data",
    "transition data analyst",
    "data scientist reconversion",
    "coach IA carrière",
    "formation data",
    "parcours data",
  ],
  authors: [{ name: "NextMove AI" }],
  creator: "NextMove AI",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Votre coach IA pour la transition data`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Votre coach IA pour la transition data`,
    description: SITE_DESCRIPTION,
    creator: "@nextmove_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#101419",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${jakarta.variable} font-body antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
