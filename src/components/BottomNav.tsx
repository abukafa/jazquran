"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const showStreak = role === "guru" || role === "murid";

  const getLinkClass = (path: string) => {
    return pathname === path 
      ? "flex flex-col items-center gap-1 flex-1 text-sage-500 font-bold"
      : "flex flex-col items-center gap-1 flex-1 text-slate-400 hover:text-sage-500 transition";
  };

  return (
    <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex justify-between items-center z-40 rounded-t-3xl shadow-lg shrink-0">
      <Link href="/dashboard" className={getLinkClass("/dashboard")}>
        <i className="fa-solid fa-house text-lg"></i>
        <span className="text-[9px]">Beranda</span>
      </Link>
      <Link href="/dashboard/ziyadah" className={getLinkClass("/dashboard/ziyadah")}>
        <i className="fa-solid fa-microphone-lines text-lg"></i>
        <span className="text-[9px]">Ziyadah</span>
      </Link>
      <Link href="/dashboard/murojaah" className={getLinkClass("/dashboard/murojaah")}>
        <i className="fa-solid fa-book-open-reader text-lg"></i>
        <span className="text-[9px]">Muroja'ah</span>
      </Link>
      {showStreak ? (
        <Link href="/dashboard/streak" className={getLinkClass("/dashboard/streak")}>
          <i className="fa-solid fa-fire text-lg"></i>
          <span className="text-[9px]">Streak</span>
        </Link>
      ) : (
        <Link href="/dashboard/graph" className={getLinkClass("/dashboard/graph")}>
          <i className="fa-solid fa-chart-simple text-lg"></i>
          <span className="text-[9px]">Grafik</span>
        </Link>
      )}
      <Link href="/dashboard/profile" className={getLinkClass("/dashboard/profile")}>
        <i className="fa-solid fa-user-gear text-lg"></i>
        <span className="text-[9px]">Profil</span>
      </Link>
    </div>
  );
}
