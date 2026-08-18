"use client";

import { useEffect } from "react";
import { useInitialSync } from "@/hooks/useInitialSync";
import { useSyncQueue } from "@/hooks/useSyncQueue";

export default function OfflineSyncManager() {
  const { error } = useInitialSync();
  useSyncQueue();

  useEffect(() => {
    if (error) {
      console.error("OfflineSyncManager error:", error);
    }
  }, [error]);

  return null; // This component doesn't render anything
}
