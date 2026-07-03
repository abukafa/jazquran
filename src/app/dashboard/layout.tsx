"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import HeroCard from "@/components/HeroCard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentRole) {
      router.push("/login");
    }
  }, [state.currentRole, router]);

  if (!state.currentRole) return null;

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24 relative flex flex-col">
        <div className="px-5 pt-6 pb-2">
          <HeroCard />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
