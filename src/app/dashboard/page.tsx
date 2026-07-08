"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import AlertModal from "@/components/AlertModal";

export default function DashboardHome() {
  const { state } = useAppContext();
  
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: () => {},
  });

  const handleUpcomingFeature = (featureName: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Fitur Segera Hadir",
      message: `Fitur ${featureName} masih dalam tahap pengembangan dan akan segera hadir!`,
      type: "alert",
      onConfirm: () => setAlertConfig((prev) => ({ ...prev, isOpen: false })),
    });
  };

  return (
    <div className="px-5 mt-4 space-y-6 pb-24">
      {/* Sub-dashboard injected dynamically based on role (placeholder for now) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800">Selamat datang di Dasbor!</h3>
        <p className="text-sm text-slate-500 mt-2">
          Anda login sebagai:{" "}
          <span className="font-bold text-sage-600">
            {state.currentRole?.toUpperCase()}
          </span>
        </p>
        <p className="text-sm text-slate-500 mt-4">
          Silakan gunakan navigasi ke fitur-fitur seperti Ziyadah, Muroja'ah,
          Grafik, dan Profil.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Mushaf Madinah */}
        <button 
          onClick={() => window.open('/mushaf?start=1&end=604', 'MushafWindow', 'width=600,height=800')}
          className="relative overflow-hidden group bg-gradient-to-br from-sage-50 to-sage-100 p-5 rounded-3xl border border-sage-200 shadow-sm flex flex-col items-center justify-center space-y-3 hover:shadow-md hover:-translate-y-1 transition duration-300"
        >
          {/* Texture Motif */}
          <svg className="absolute inset-0 w-full h-full text-sage-900 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="motif-sage" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M16 0l2 14 14 2-14 2-2 14-2-14-14-2 14-2z" fill="currentColor" fillOpacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#motif-sage)"></rect>
          </svg>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-sage-200/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-12 h-12 bg-sage-200/50 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500 delay-75"></div>
          
          <div className="relative p-3 bg-white/80 backdrop-blur text-sage-600 rounded-2xl shadow-sm flex items-center justify-center w-12 h-12 z-10 border border-sage-100">
            <i className="fas fa-book-open text-xl"></i>
          </div>
          <span className="relative z-10 font-bold text-sage-800 text-sm text-center tracking-wide">Mushaf<br/>Madinah</span>
        </button>

        {/* Card 2: Quotes Qurani */}
        <Link 
          href="/dashboard/quotes"
          className="relative overflow-hidden group bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-3xl border border-blue-200 shadow-sm flex flex-col items-center justify-center space-y-3 hover:shadow-md hover:-translate-y-1 transition duration-300"
        >
          {/* Texture Motif */}
          <svg className="absolute inset-0 w-full h-full text-blue-900 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="motif-blue" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M16 0l2 14 14 2-14 2-2 14-2-14-14-2 14-2z" fill="currentColor" fillOpacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#motif-blue)"></rect>
          </svg>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-blue-200/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-12 h-12 bg-blue-200/50 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500 delay-75"></div>
          
          <div className="relative p-3 bg-white/80 backdrop-blur text-blue-600 rounded-2xl shadow-sm flex items-center justify-center w-12 h-12 z-10 border border-blue-100">
            <i className="fas fa-quote-right text-xl"></i>
          </div>
          <span className="relative z-10 font-bold text-blue-800 text-sm text-center tracking-wide">Quotes<br/>Qurani</span>
        </Link>

        {/* Card 3: Prayer Time */}
        <Link 
          href="/dashboard/prayer-time"
          className="relative overflow-hidden group bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col items-center justify-center space-y-3 hover:shadow-md hover:-translate-y-1 transition duration-300"
        >
          {/* Texture Motif */}
          <svg className="absolute inset-0 w-full h-full text-amber-900 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="motif-amber" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M16 0l2 14 14 2-14 2-2 14-2-14-14-2 14-2z" fill="currentColor" fillOpacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#motif-amber)"></rect>
          </svg>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-amber-200/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-12 h-12 bg-amber-200/50 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500 delay-75"></div>
          
          <div className="relative p-3 bg-white/80 backdrop-blur text-amber-600 rounded-2xl shadow-sm flex items-center justify-center w-12 h-12 z-10 border border-amber-100">
            <i className="fas fa-clock text-xl"></i>
          </div>
          <span className="relative z-10 font-bold text-amber-800 text-sm text-center tracking-wide">Prayer<br/>Time</span>
        </Link>

        {/* Card 4: Qibla Direction */}
        <Link 
          href="/dashboard/qibla-direction"
          className="relative overflow-hidden group bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-3xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center space-y-3 hover:shadow-md hover:-translate-y-1 transition duration-300"
        >
          {/* Texture Motif */}
          <svg className="absolute inset-0 w-full h-full text-emerald-900 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="motif-emerald" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M16 0l2 14 14 2-14 2-2 14-2-14-14-2 14-2z" fill="currentColor" fillOpacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#motif-emerald)"></rect>
          </svg>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-emerald-200/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-12 h-12 bg-emerald-200/50 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500 delay-75"></div>
          
          <div className="relative p-3 bg-white/80 backdrop-blur text-emerald-600 rounded-2xl shadow-sm flex items-center justify-center w-12 h-12 z-10 border border-emerald-100">
            <i className="fas fa-compass text-xl"></i>
          </div>
          <span className="relative z-10 font-bold text-emerald-800 text-sm text-center tracking-wide">Qibla<br/>Direction</span>
        </Link>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
