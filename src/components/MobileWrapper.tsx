"use client";
import React from "react";

export default function MobileWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center font-sans antialiased text-slate-800">
      <div className="mobile-frame bg-sage-50 w-full min-h-screen sm:min-h-0 flex flex-col shadow-inner">
        {children}
      </div>
    </div>
  );
}
