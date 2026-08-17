"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import MobileWrapper from "./MobileWrapper";
import OfflineSyncManager from "./OfflineSyncManager";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        <OfflineSyncManager />
        <MobileWrapper>
          {children}
        </MobileWrapper>
      </AppProvider>
    </SessionProvider>
  );
}
