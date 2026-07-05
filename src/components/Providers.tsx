"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import MobileWrapper from "./MobileWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        <MobileWrapper>
          {children}
        </MobileWrapper>
      </AppProvider>
    </SessionProvider>
  );
}
