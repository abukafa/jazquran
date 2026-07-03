"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";

export default function HeroCard() {
  const { state } = useAppContext();
  const role = state.currentRole;
  const student = state.students[0]; // mock active student

  if (role === "super-admin") {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl"><i className="fa-solid fa-server"></i></div>
        <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Super Administrator</span>
        <h2 className="text-xl font-black mt-2">Dasbor Kendali Pusat</h2>
        <p className="text-slate-400 text-xs mt-1">Sistem SaaS Multi-Tenant Jaz Academy</p>
      </div>
    );
  }

  if (role === "admin-tenant") {
    return (
      <div className="bg-gradient-to-br from-sage-500 to-sage-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 text-9xl"><i className="fa-solid fa-school"></i></div>
        <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Admin Sekolah</span>
        <h2 className="text-xl font-black mt-2">Jaz Academy Jakarta</h2>
        <p className="text-sage-100 text-xs mt-1">Periode Semester Ganjil 2025/2026</p>
      </div>
    );
  }

  if (role === "guru") {
    return (
      <div className="bg-gradient-to-br from-sage-600 to-sage-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 text-9xl"><i className="fa-solid fa-chalkboard-user"></i></div>
        <span className="bg-emerald-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Ustadz Pengampu</span>
        <h2 className="text-xl font-black mt-2">Ustadz Ahmad Fauzi</h2>
        <p className="text-sage-100 text-xs mt-1">Halaqah Tahfidz Al-Mulk (6 Santri)</p>
      </div>
    );
  }

  // default to murid
  return (
    <div className="bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 opacity-15 text-8xl"><i className="fa-solid fa-book-quran"></i></div>
      <div className="flex items-center gap-3 mb-3">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128" className="w-12 h-12 rounded-full border-2 border-white/50 object-cover shadow-sm" alt="Profile" />
        <div>
          <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Santri Utama</span>
          <h2 className="text-base font-extrabold leading-tight">{student?.name}</h2>
        </div>
      </div>
      <div className="bg-white/10 rounded-2xl p-3 flex justify-between items-center text-xs">
        <div>
          <span className="text-sage-100 block text-[10px]">Hafalan Saat Ini</span>
          <span className="font-bold text-sm">Juz {student?.currentJuz}, Hal {student?.currentHal}</span>
        </div>
        <div className="text-right">
          <span className="text-sage-100 block text-[10px]">Sisa Target</span>
          <span className="font-bold text-sm">{student?.totalJuz} Juz</span>
        </div>
      </div>
    </div>
  );
}
