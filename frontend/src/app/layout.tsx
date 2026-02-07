import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/feedback/Toaster";
import { MSWProvider } from "@/components/MSWProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Multi-Agent Trader | AI-Powered Trading Platform",
  description: "Advanced autonomous trading platform powered by multi-agent AI systems combining MAHORAGA and TauricResearch intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <MSWProvider>
          {children}
        </MSWProvider>
        <Toaster />
      </body>
    </html>
  );
}
