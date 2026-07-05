"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getHalaqahDetailsForGuru,
  setStudentTartil,
  setStudentPartnerGuru,
} from "@/actions/guru";

export default function GuruHalaqohPage() {
  const params = useParams();
  const halaqahId = params.id as string;

  const [halaqah, setHalaqah] = useState<{ _id: string; name: string } | null>(
    null,
  );
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Tap-to-Pair
  const [pairingModeId, setPairingModeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unpairConfirm, setUnpairConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (halaqahId) {
      fetchData();
    }
  }, [halaqahId]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getHalaqahDetailsForGuru(halaqahId);
    if (res.success && res.halaqah && res.students) {
      setHalaqah(res.halaqah);
      setStudents(res.students);
    }
    setLoading(false);
  };

  const handleSetTartil = async (studentId: string, tartil: string) => {
    setIsProcessing(true);
    const res = await setStudentTartil(studentId, tartil as any);
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  const handlePairingSelect = async (partnerId: string) => {
    if (!pairingModeId) return;
    setIsProcessing(true);
    const res = await setStudentPartnerGuru(pairingModeId, partnerId);
    if (res.success) {
      setPairingModeId(null);
      await fetchData();
    } else {
      alert(res.error);
      setPairingModeId(null);
    }
    setIsProcessing(false);
  };

  const handleUnpair = (studentId: string) => {
    setUnpairConfirm(studentId);
  };

  const confirmUnpair = async () => {
    if (!unpairConfirm) return;
    setIsProcessing(true);
    const res = await setStudentPartnerGuru(unpairConfirm, null);
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error);
    }
    setIsProcessing(false);
    setUnpairConfirm(null);
  };

  // Pengelompokan Data
  const pairedStudents = students.filter((s) => s.partnerId);
  const unpairedStudents = students.filter((s) => !s.partnerId);

  const printedPairIds = new Set<string>();
  const pairsToRender = [];
  for (const s of pairedStudents) {
    if (!printedPairIds.has(s._id)) {
      const partner = pairedStudents.find((p) => p._id === s.partnerId);
      if (partner) {
        pairsToRender.push([s, partner]);
        printedPairIds.add(s._id);
        printedPairIds.add(partner._id);
      } else {
        pairsToRender.push([s]);
        printedPairIds.add(s._id);
      }
    }
  }

  return (
    <div className="p-5 space-y-6 pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/profile"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition shrink-0"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">
            Kelola Halaqah
          </h1>
          <p className="text-xs text-slate-500">
            {halaqah ? halaqah.name : "Memuat..."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
        </div>
      ) : (
        <>
          {/* Instruksi Pairing Mode */}
          {pairingModeId && (
            <div className="bg-sage-600 text-white p-4 rounded-2xl shadow-lg sticky top-4 z-50 animate-bounce-slow">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-bold block">Mode Memasangkan</span>
                  Pilih satu murid lain dari daftar di bawah.
                </div>
                <button
                  onClick={() => setPairingModeId(null)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
          )}

          {/* Section: Pasangan Muroja'ah */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 pl-2">
              Partner Muroja'ah ({pairsToRender.length})
            </h2>
            {pairsToRender.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 text-center text-xs text-slate-400 shadow-sm">
                Belum ada pasangan.
              </div>
            ) : (
              <div className="space-y-4">
                {pairsToRender.map((pair, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-sage-50 to-white border border-sage-100 p-4 rounded-3xl shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-sage-200 text-sage-600 rounded-full flex items-center justify-center text-xs z-10 shadow-sm">
                      <i className="fa-solid fa-handshake"></i>
                    </div>

                    <button
                      onClick={() => handleUnpair(pair[0]._id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white text-rose-400 hover:text-rose-600 rounded-full flex items-center justify-center text-xs shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition border border-rose-100 z-20"
                      title="Pisahkan Pasangan"
                    >
                      <i className="fa-solid fa-unlink"></i>
                    </button>

                    <div className="flex gap-4 relative z-0">
                      {/* Murid 1 */}
                      <div className="flex-1 w-0 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative z-20">
                        <p
                          className="font-bold text-slate-800 text-sm mb-2 truncate"
                          title={pair[0].nama}
                        >
                          {pair[0].nama}
                        </p>
                        <select
                          value={pair[0].tingkatanTartil}
                          onChange={(e) =>
                            handleSetTartil(pair[0]._id, e.target.value)
                          }
                          disabled={isProcessing}
                          className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded-lg px-2 py-1.5 font-bold text-slate-600 outline-none focus:border-sage-400"
                        >
                          <option value="Awal">Tartil Awal</option>
                          <option value="Menengah">Tartil Menengah</option>
                          <option value="Akhir">Tartil Akhir</option>
                        </select>
                      </div>

                      {/* Murid 2 */}
                      {pair[1] && (
                        <div className="flex-1 w-0 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative z-20">
                          <p
                            className="font-bold text-slate-800 text-sm mb-2 truncate text-right"
                            title={pair[1].nama}
                          >
                            {pair[1].nama}
                          </p>
                          <select
                            value={pair[1].tingkatanTartil}
                            onChange={(e) =>
                              handleSetTartil(pair[1]._id, e.target.value)
                            }
                            disabled={isProcessing}
                            className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded-lg px-2 py-1.5 font-bold text-slate-600 outline-none focus:border-sage-400 text-right"
                          >
                            <option value="Awal">Tartil Awal</option>
                            <option value="Menengah">Tartil Menengah</option>
                            <option value="Akhir">Tartil Akhir</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Belum Memiliki Partner */}
          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-bold text-slate-700 pl-2">
              Belum Memiliki Partner ({unpairedStudents.length})
            </h2>
            {unpairedStudents.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 text-center text-xs text-slate-400 shadow-sm">
                Semua murid sudah memiliki partner.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {unpairedStudents.map((s) => {
                  const isPairingTarget = pairingModeId === s._id;
                  const isSelectable = pairingModeId && !isPairingTarget;

                  return (
                    <div
                      key={s._id}
                      onClick={() =>
                        isSelectable ? handlePairingSelect(s._id) : undefined
                      }
                      className={`
                        bg-white p-4 rounded-3xl border shadow-sm transition-all duration-300 relative
                        ${isPairingTarget ? "border-sage-500 ring-4 ring-sage-100 scale-105 z-10" : "border-slate-100"}
                        ${isSelectable ? "cursor-pointer hover:border-sage-300 hover:shadow-md hover:-translate-y-1" : ""}
                        ${pairingModeId && !isPairingTarget && !isSelectable ? "opacity-50" : ""}
                      `}
                    >
                      {isSelectable && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs animate-ping shadow-md"></div>
                      )}
                      {isSelectable && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-md z-10">
                          <i className="fa-solid fa-hand-pointer"></i>
                        </div>
                      )}

                      <h3
                        className="font-bold text-slate-800 text-sm mb-3 truncate"
                        title={s.nama}
                      >
                        {s.nama}
                      </h3>

                      <select
                        value={s.tingkatanTartil}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSetTartil(s._id, e.target.value);
                        }}
                        disabled={isProcessing || !!pairingModeId}
                        className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded-lg px-2 py-2 font-bold text-slate-600 outline-none focus:border-sage-400 mb-3 relative z-20"
                      >
                        <option value="Awal">Tartil Awal</option>
                        <option value="Menengah">Tartil Menengah</option>
                        <option value="Akhir">Tartil Akhir</option>
                      </select>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPairingTarget) {
                            setPairingModeId(null);
                          } else {
                            setPairingModeId(s._id);
                          }
                        }}
                        disabled={isProcessing}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 relative z-20
                          ${
                            isPairingTarget
                              ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                              : "bg-slate-800 text-white hover:bg-slate-900"
                          }
                          ${isSelectable ? "opacity-0 pointer-events-none absolute" : ""}
                        `}
                      >
                        {isPairingTarget ? (
                          <>
                            Batal <i className="fa-solid fa-times"></i>
                          </>
                        ) : (
                          <>
                            Pasangkan <i className="fa-solid fa-link"></i>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Confirm Unpair */}
      {unpairConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="fa-solid fa-unlink"></i>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 mb-2">
              Pisahkan Pasangan?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Yakin ingin memisahkan pasangan muroja'ah ini? Keduanya akan
              kembali ke daftar "Belum Memiliki Partner".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUnpairConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={confirmUnpair}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition"
              >
                Pisahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
