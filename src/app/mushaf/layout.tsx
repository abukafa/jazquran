import { Amiri_Quran } from "next/font/google";
import React from "react";

const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
  display: "swap",
});

export default function MushafLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${amiriQuran.variable} bg-[#F4F3ED] min-h-screen text-[#222]`}>
      {children}
    </div>
  );
}
