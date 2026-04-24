import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTokShop Task to Earn",
  description: "Crypto-powered task earning platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />        
      </head>
      <body className="coin-bg">
        <Navbar />
        <main className="app-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
