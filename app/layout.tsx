import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Data Transition | Mentorat senior pour votre transition data",
  description:
    "Accompagnement structur\u00e9 pour les profils fonctionnels exp\u00e9riment\u00e9s (RH/SIRH/AMOA/IT) qui veulent un r\u00f4le data cr\u00e9dible. Mentorat senior, pas formation.",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
