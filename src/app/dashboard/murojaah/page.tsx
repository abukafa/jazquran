"use client";
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function MurojaahPage() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<"partner" | "tatsbit">("partner");

  const filteredData = state.mutabaahData.filter(
    (item) => item.type === "tatsbit"
  );

  return (
    <div className="px-5 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800">Evaluasi Hafalan</h3>
        </div>

        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab("partner")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'partner' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Muroja'ah Partner
          </button>
          <button 
            onClick={() => setActiveTab("tatsbit")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'tatsbit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tatsbit (Guru)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-slate-800 text-sm">
            {activeTab === 'partner' ? "Verifikasi Muroja'ah Partner" : "Ujian Tatsbit"}
          </h4>
          <span className="text-[10px] bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-bold">10 Halaman</span>
        </div>
        <p className="text-slate-500 text-xs mb-4">
          {activeTab === 'partner' 
            ? "Laporkan penyelesaian setoran minimal 10 halaman bersama partner yang telah ditentukan."
            : "Input pencatatan ujian penguatan 5 halaman ke belakang dari hafalan baru murid."
          }
        </p>
        
        <div className="space-y-3">
          <button className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold py-3 rounded-xl transition text-xs shadow-md shadow-sage-500/20">
            {activeTab === 'partner' ? "Verifikasi Partner Selesai" : "Mulai Ujian Tatsbit"}
          </button>
        </div>
      </div>

      {activeTab === 'tatsbit' && (
        <div className="space-y-3 pb-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Riwayat Tatsbit</h4>
          <div className="space-y-2">
            {filteredData.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-xs text-slate-800">{item.studentName}</h5>
                  <span className="text-[10px] text-slate-500">Juz {item.juz}, Hal {item.fromHal}-{item.toHal}</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-[10px]">Nilai: {item.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
