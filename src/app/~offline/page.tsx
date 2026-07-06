"use client";

import React from "react";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function OfflinePage() {
  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-6 ${inter.className}`}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
          <i className="fa-solid fa-wifi-slash text-4xl text-rose-500"></i>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Anda Sedang Offline
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Sepertinya koneksi internet Anda terputus. Halaman ini belum tersedia di penyimpanan lokal (cache).
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600 text-left space-y-2 border border-slate-100">
          <p className="font-bold text-slate-700 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-amber-500"></i>
            Tips:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Periksa koneksi WiFi atau Data Seluler Anda.</li>
            <li>Aplikasi tetap bisa digunakan secara offline untuk fitur yang sudah dimuat sebelumnya.</li>
          </ul>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          <i className="fa-solid fa-rotate-right"></i>
          Coba Muat Ulang
        </button>
        
        <Link 
          href="/" 
          className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
