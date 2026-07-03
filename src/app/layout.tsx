import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AppProvider } from "@/context/AppContext";
import MobileWrapper from "@/components/MobileWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jaz Academy Tahfidz Tracker",
  description: "Platform PWA Mutabaah & Tahfidz Al-Qur'an Multi-Tenant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AppProvider>
          <MobileWrapper>
            {children}
          </MobileWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
