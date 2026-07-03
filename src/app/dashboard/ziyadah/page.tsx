"use client";
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function ZiyadahPage() {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = state.mutabaahData.filter(
    (item) => item.type === "ziyadah" && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-800">Mutabaah Ziyadah</h3>
        <span className="bg-sage-100 text-sage-700 text-xs font-bold px-2.5 py-1 rounded-full">{state.currentRole === "guru" ? "Guru Mode" : "Santri Mode"}</span>
      </div>

      {state.currentRole === "guru" && (
        <div className="grid grid-cols-3 gap-2.5">
          <button className="bg-white border border-sage-500/20 p-3 rounded-2xl flex flex-col items-center text-center gap-1 shadow-sm hover:border-sage-500 transition">
            <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center text-sage-500">
              <i className="fa-solid fa-microphone-lines text-sm"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-700">Setoran Baru</span>
          </button>
          <button className="bg-white border border-sage-500/20 p-3 rounded-2xl flex flex-col items-center text-center gap-1 shadow-sm hover:border-sage-500 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-book-open-reader text-sm"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-700">Talaqqi 20x</span>
          </button>
          <button className="bg-white border border-sage-500/20 p-3 rounded-2xl flex flex-col items-center text-center gap-1 shadow-sm hover:border-sage-500 transition">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <i className="fa-solid fa-eye text-sm"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-700">Bin-Nadzor</span>
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Cari santri..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sage-500/20" 
        />
        <select className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sage-500/20">
          <option value="">Semua Juz</option>
          <option value="30">Juz 30</option>
          <option value="29">Juz 29</option>
          <option value="28">Juz 28</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50/70 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-3">Santri</th>
                <th className="px-4 py-3">Setoran (Ziyadah)</th>
                <th className="px-4 py-3 text-center">Bin-Nadzor</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold">{item.studentName}</td>
                  <td className="px-4 py-3">Juz {item.juz}, Hal {item.fromHal}-{item.toHal}</td>
                  <td className="px-4 py-3 text-center">
                    {item.binNadzor ? <i className="fa-solid fa-check text-sage-500"></i> : <i className="fa-solid fa-minus text-slate-300"></i>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.score === 'A' ? 'bg-emerald-100 text-emerald-700' :
                      item.score.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{item.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
