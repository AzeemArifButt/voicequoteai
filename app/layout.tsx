import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Geist, Geist_Mono } from "next/font/google";
import PaddleProvider from "@/components/PaddleProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoiceQuote AI – Professional Quotes in 30 Seconds",
  description:
    "Generate polished client proposals by voice. Speak your project details and get a print-ready PDF proposal in seconds. Free to start.",
  keywords: [
    "quote generator",
    "business proposal",
    "AI",
    "voice",
    "contractor",
    "freelancer",
    "PDF proposal",
  ],
  metadataBase: new URL("https://voicequoteai.vercel.app"),
  openGraph: {
    title: "VoiceQuote AI – Professional Quotes in 30 Seconds",
    description:
      "Generate polished client proposals by voice. Free to start.",
    url: "https://voicequoteai.vercel.app",
    siteName: "VoiceQuote AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceQuote AI – Professional Quotes in 30 Seconds",
    description: "Generate polished client proposals by voice. Free to start.",
  },
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const inner = (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <PaddleProvider />
        <Analytics />
      </body>
    </html>
  );

  return clerkKey ? <ClerkProvider>{inner}</ClerkProvider> : inner;
}
