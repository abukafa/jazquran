"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import AlertModal from "@/components/AlertModal";
import { SURAH_LIST, getJuzRange } from "@/lib/mushaf";

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

  // Modal Mushaf State
  const [isMushafModalOpen, setIsMushafModalOpen] = useState(false);
  const [mushafMode, setMushafMode] = useState<"juz" | "surah" | "all">("juz");
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);

  const handleOpenMushaf = () => {
    let startPage = 1;
    let endPage = 604;
    if (mushafMode === "juz") {
      const range = getJuzRange(selectedJuz);
      startPage = range.startPage;
      endPage = range.endPage;
    } else if (mushafMode === "surah") {
      const surah = SURAH_LIST.find((s) => s.id === Number(selectedSurah)) || SURAH_LIST[0];
      startPage = surah.startPage;
      endPage = surah.endPage;
    } else {
      startPage = 1;
      endPage = 604;
    }
    window.open(`/mushaf?start=${startPage}&end=${endPage}`, "MushafWindow", "width=600,height=800");
    setIsMushafModalOpen(false);
  };

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
          onClick={() => setIsMushafModalOpen(true)}
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

      {/* Modal Buka Mushaf Madinah */}
      {isMushafModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-book-quran"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Buka Mushaf Madinah</h3>
                  <p className="text-xs text-slate-500">Pilih rentang atau tampilan mushaf</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMushafModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMushafMode("juz")}
                className={`py-2 px-2 rounded-xl transition ${
                  mushafMode === "juz"
                    ? "bg-white text-sage-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Per Juz
              </button>
              <button
                type="button"
                onClick={() => setMushafMode("surah")}
                className={`py-2 px-2 rounded-xl transition ${
                  mushafMode === "surah"
                    ? "bg-white text-sage-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Per Surah
              </button>
              <button
                type="button"
                onClick={() => setMushafMode("all")}
                className={`py-2 px-2 rounded-xl transition ${
                  mushafMode === "all"
                    ? "bg-white text-sage-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua Juz
              </button>
            </div>

            {/* Mode Content */}
            <div className="py-2">
              {mushafMode === "juz" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Juz Al-Qur'an (Juz 1 - 30)
                  </label>
                  <select
                    value={selectedJuz}
                    onChange={(e) => setSelectedJuz(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                      <option key={juz} value={juz}>
                        Juz {juz}
                      </option>
                    ))}
                  </select>
                  <div className="p-3 bg-sage-50 border border-sage-100 rounded-2xl text-xs text-sage-800 flex items-center space-x-2">
                    <i className="fa-solid fa-circle-info text-sage-600"></i>
                    <span>
                      Menampilkan <b>{getJuzRange(selectedJuz).endPage - getJuzRange(selectedJuz).startPage + 1} halaman</b> untuk <b>Juz {selectedJuz}</b> (Hal. {getJuzRange(selectedJuz).startPage}–{getJuzRange(selectedJuz).endPage}).
                    </span>
                  </div>
                </div>
              )}

              {mushafMode === "surah" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Surah (1 - 114)
                  </label>
                  <select
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    {SURAH_LIST.map((surah) => (
                      <option key={surah.id} value={surah.id}>
                        {surah.name}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const selectedInfo = SURAH_LIST.find((s) => s.id === selectedSurah) || SURAH_LIST[0];
                    return (
                      <div className="p-3 bg-sage-50 border border-sage-100 rounded-2xl text-xs text-sage-800 flex items-center space-x-2">
                        <i className="fa-solid fa-circle-info text-sage-600"></i>
                        <span>
                          Menampilkan <b>{selectedInfo.name}</b> mulai Hal. {selectedInfo.startPage} s/d {selectedInfo.endPage}.
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {mushafMode === "all" && (
                <div className="p-4 bg-sage-50 border border-sage-100 rounded-2xl text-xs text-sage-800 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sage-900">
                    <i className="fa-solid fa-book-open text-sage-700 text-sm"></i>
                    <span>Tampilkan Full Mushaf (30 Juz)</span>
                  </div>
                  <p className="text-sage-700 leading-relaxed">
                    Mushaf Madinah standar terdiri dari <b>604 halaman</b>. Anda dapat menjelajahi seluruh halaman dari Juz 1 hingga Juz 30.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMushafModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleOpenMushaf}
                className="px-6 py-2.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-md shadow-sage-200 hover:shadow-lg transition flex items-center space-x-2"
              >
                <i className="fa-solid fa-book-open"></i>
                <span>Buka Mushaf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
