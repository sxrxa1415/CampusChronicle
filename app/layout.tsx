import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CampusChronicle - Annual Report Portal",
  description:
    "Annual Report Generation Portal for Sri Ramakrishna Engineering College, Coimbatore — streamlined data collection, KPI analytics, and automated report generation.",
  keywords: ["annual report", "college", "KPI", "department", "Tamil Nadu"],
};

export const viewport: Viewport = {
  themeColor: "#5B4FCF",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
