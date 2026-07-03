"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";

export default function DashboardHome() {
  const { state } = useAppContext();
  
  return (
    <div className="px-5 space-y-6">
      {/* Sub-dashboard injected dynamically based on role (placeholder for now) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800">Selamat datang di Dasbor!</h3>
        <p className="text-sm text-slate-500 mt-2">Anda login sebagai: <span className="font-bold text-sage-600">{state.currentRole}</span></p>
        <p className="text-sm text-slate-500 mt-4">Silakan gunakan menu di bawah untuk bernavigasi ke fitur-fitur seperti Ziyadah, Muroja'ah, Grafik, dan Profil.</p>
      </div>
    </div>
  );
}
