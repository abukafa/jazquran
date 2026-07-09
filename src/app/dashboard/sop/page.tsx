"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function SopPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-20">
      <div className="px-5 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">SOP & Panduan</h1>
            <p className="text-xs text-slate-500">Standar Operasional Prosedur JazQuran</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center text-lg">
                <i className="fa-solid fa-book-quran"></i>
              </div>
              <h2 className="text-sm font-bold text-slate-800">1. Konsep Hafalan Tasbit</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed text-justify mb-3">
              <span className="font-bold text-sage-600">Tasbit</span> adalah sebuah pendekatan tahfiz yang tidak terburu-buru mengejar kuantitas hafalan baru (ziyadah), melainkan memastikan kualitas hafalan lama tetap terjaga. Santri diwajibkan menyetorkan murojaah dalam porsi yang jauh lebih besar dan konsisten setiap harinya.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              Dalam standar JazQuran, seorang santri idealnya menyetorkan 1 Juz Murojaah setiap hari sebelum diizinkan menambah hafalan baru (Ziyadah). Jika setoran Murojaah belum mencapai target atau dinilai kurang lancar oleh guru, maka penambahan Ziyadah pada hari itu ditangguhkan.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg">
                <i className="fa-solid fa-users"></i>
              </div>
              <h2 className="text-sm font-bold text-slate-800">2. Murojaah Partner</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              Selain disetorkan kepada Guru, santri sangat dianjurkan memiliki <span className="font-bold text-blue-500">Murojaah Partner</span> (teman setoran). Santri saling menyimak hafalan satu sama lain untuk melatih mental dan melancarkan lisan sebelum disetorkan ke Guru. Rekaman aktivitas Murojaah Partner ini juga dicatat dalam aplikasi untuk melacak intensitas hafalan (Heatmap & Streak).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg">
                <i className="fa-solid fa-mobile-screen"></i>
              </div>
              <h2 className="text-sm font-bold text-slate-800">3. Penggunaan Aplikasi Singkat</h2>
            </div>
            <ul className="text-xs text-slate-600 leading-relaxed space-y-2 list-disc list-inside">
              <li><span className="font-bold">Murid/Santri:</span> Bertugas melaporkan perkembangan harian mulai dari Murojaah Partner, Hafalan Mandiri, hingga target bacaan. Santri bisa memantau "Streak" (runtutan setoran) dan peta intensitas di beranda.</li>
              <li><span className="font-bold">Guru:</span> Menerima setoran Ziyadah dan Tatsbit di halaqah, memberi penilaian kelancaran, dan menyetujui laporan Murojaah harian santri.</li>
              <li><span className="font-bold">Admin Cabang:</span> Menambah data guru, mendaftarkan santri, membuat Halaqah, dan memantau keseluruhan progres dari sekolah/pondok.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
