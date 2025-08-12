import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Letta AI",
  description: "The frontend for the Letta AI platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        {/* The background gradient can stay as it's a global style */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-3xl -z-10"></div>
        {children}
      </body>
    </html>
  );
}
