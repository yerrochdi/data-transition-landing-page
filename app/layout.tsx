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

export const metadata: Metadata = {
  title: "NextMove AI | Your AI-Powered Career Evolution Platform",
  description:
    "NextMove is an AI-first platform that accelerates your professional transition with specialized agents, structured pathways, and intelligent guidance.",
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
