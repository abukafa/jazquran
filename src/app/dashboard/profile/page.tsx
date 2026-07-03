"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function ProfilePage() {
  const { state, logout } = useAppContext();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const student = state.students[0];

  return (
    <div className="px-5 space-y-6 pb-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-sage-500 to-sage-600"></div>
        <div className="relative pt-6">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" className="w-20 h-20 rounded-full border-4 border-white mx-auto shadow-md object-cover" alt="Avatar" />
          <h3 className="text-lg font-bold text-slate-800 mt-2">{state.currentRole === "murid" ? student.name : "Pengguna Aktif"}</h3>
          <p className="text-xs text-slate-400">Jaz Academy Jakarta</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-slate-100">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block">Email Terdaftar</span>
            <span className="text-xs font-bold text-slate-700">user@example.com</span>
          </div>
          <div className="text-left border-l border-slate-100 pl-4">
            <span className="text-[10px] text-slate-400 block">Peran Sistem</span>
            <span className="text-xs font-bold text-sage-600 uppercase">{state.currentRole}</span>
          </div>
        </div>
      </div>

      {state.currentRole === "super-admin" && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Konfigurasi Global (Super-Admin)</h4>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <button className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition">
              <span><i className="fa-solid fa-square-plus mr-2"></i> Tambah Tenant Baru</span>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {state.currentRole === "admin-tenant" && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Kelola Data Tenant (Admin)</h4>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <button className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition">
              <span><i className="fa-solid fa-user-plus mr-2"></i> Daftarkan Ustadz / Guru</span>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition">
              <span><i className="fa-solid fa-graduation-cap mr-2"></i> Registrasi Santri Baru</span>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button onClick={handleLogout} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3.5 rounded-2xl transition text-xs flex items-center justify-center gap-2">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Keluar dari Aplikasi</span>
        </button>
      </div>
    </div>
  );
}
