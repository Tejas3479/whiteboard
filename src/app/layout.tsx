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
  title: "SynapseBoard — AI Collaborative Whiteboard",
  description: "Real-time collaborative whiteboard powered by AI diagram intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="antialiased h-full w-full m-0 p-0 bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
