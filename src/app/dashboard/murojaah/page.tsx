"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { getMyHalaqahs } from "@/actions/guru";
import {
  getMurojaahByDate,
  submitMurojaahPartnerData,
  submitTatsbitData,
  getMuridMurojaahData,
} from "@/actions/murojaah";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { addToSyncQueue } from "@/lib/localdb";
import { getPagesInJuz, calculateBinNadzorRange } from "@/lib/mushaf";
import AlertModal from "@/components/AlertModal";

export default function MurojaahPage() {
  const { state } = useAppContext();
  const { isOnline } = useNetworkStatus();

  const [halaqahs, setHalaqahs] = useState<any[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [muridPartnerData, setMuridPartnerData] = useState<any>(null); // Khusus Murid
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeModal, setActiveModal] = useState<"partner" | "tatsbit" | null>(
    null,
  );
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null); // Untuk keperluan prefill form edit

  const [formData, setFormData] = useState({
    partnerJuz: "",
    partnerHalDari: "",
    partnerHalKe: "",
    tatsbitJuz: "",
    tatsbitHalDari: "",
    tatsbitHalKe: "",
    tatsbitNilai: "A",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: "alert"|"confirm", onConfirm: () => void}>({
    isOpen: false, title: "", message: "", type: "alert", onConfirm: () => {}
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ isOpen: true, title, message, type: "alert", onConfirm: () => setAlertConfig(prev => ({...prev, isOpen: false})) });
  };

  useEffect(() => {
    if (
      state.currentRole === "admin-tenant" ||
      state.currentRole === "super-admin"
    ) {
      fetchHalaqahs();
    } else if (state.currentRole === "murid") {
      setSelectedDate(""); // Load histori tanpa filter by default
    }
  }, [state.currentRole]);

  useEffect(() => {
    if (
      ["admin-tenant", "super-admin"].includes(state.currentRole || "") &&
      selectedHalaqah
    ) {
      fetchData();
    } else if (state.currentRole === "guru") {
      fetchData();
    } else if (state.currentRole === "murid") {
      fetchStudentData(selectedDate);
    }
  }, [selectedHalaqah, selectedDate, state.currentRole]);

  const fetchHalaqahs = async () => {
    const res = await getMyHalaqahs();
    if (res.success && res.halaqahs && res.halaqahs.length > 0) {
      setHalaqahs(res.halaqahs);
      setSelectedHalaqah(res.halaqahs[0]._id);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const hId = state.currentRole === "guru" ? undefined : selectedHalaqah;
    const res = await getMurojaahByDate(hId as any, selectedDate);
    if (res.success && res.data) {
      setStudentsData(res.data);
    }
    setIsLoading(false);
  };

  const fetchStudentData = async (dateFilter: string) => {
    setIsLoading(true);
    const res = await getMuridMurojaahData(
      dateFilter || new Date().toISOString().split("T")[0],
    );
    if (res.success) {
      setStudentsData(res.myHistory || []);
      setMuridPartnerData(res.partnerData);
    }
    setIsLoading(false);
  };

  const filteredData = studentsData.filter((item) => {
    if (
      ["guru", "admin-tenant", "super-admin"].includes(state.currentRole || "")
    ) {
      return item.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const dateStr = new Date(item.tanggal)
        .toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .toLowerCase();
      return (
        dateStr.includes(searchTerm.toLowerCase()) ||
        (item.murojaahPartnerJuz &&
          item.murojaahPartnerJuz.toString().includes(searchTerm.toLowerCase()))
      );
    }
  });

  const openModal = (
    type: "partner" | "tatsbit",
    item: any,
    isEdit: boolean = false,
  ) => {
    setEditingItem(isEdit ? item : null);
    setActiveModal(type);
    setSelectedStudent(item._id || item.studentId);

    // Reset Form
    setFormData({
      partnerJuz: "",
      partnerHalDari: "",
      partnerHalKe: "",
      tatsbitJuz: "",
      tatsbitHalDari: "",
      tatsbitHalKe: "",
      tatsbitNilai: "A",
    });

    if (isEdit) {
      setFormData((prev) => ({
        ...prev,
        partnerJuz: item.murojaahPartnerJuz || "",
        partnerHalDari: item.murojaahPartnerDari || "",
        partnerHalKe: item.murojaahPartnerKe || "",
        tatsbitJuz: item.tatsbitJuz || "",
        tatsbitHalDari: item.tatsbitDari || "",
        tatsbitHalKe: item.tatsbitKe || "",
        tatsbitNilai: item.tatsbitNilai || "A",
      }));
    } else if (type === "tatsbit") {
      // Auto-calculate Tatsbit based on Ziyadah info if available (similar to BinNadzor)
      // Karena kita butuh halaman terakhir, jika tidak ada di state ini, kita tinggalkan kosong agar diedit manual
    }
  };

  const handleModalSubmit = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    let result = false;

    try {
      if (activeModal === "partner") {
        const payload = {
          studentId: selectedStudent,
          dateStr: selectedDate || new Date().toISOString().split("T")[0],
          murojaahData: {
            juz: parseInt(formData.partnerJuz),
            halamanDari: formData.partnerHalDari,
            halamanKe: formData.partnerHalKe,
          },
        };

        if (isOnline) {
          const res = await submitMurojaahPartnerData(payload.studentId, payload.dateStr, payload.murojaahData);
          if (res.success) result = true;
          else showAlert("Gagal Menyimpan", "Gagal menyimpan data partner: " + (res as any).error);
        } else {
          await addToSyncQueue(
            "MutabaahDaily_MurojaahPartner",
            "update",
            payload,
          );
          result = true;
        }
      } else if (activeModal === "tatsbit") {
        const payload = {
          studentId: selectedStudent,
          dateStr: selectedDate || new Date().toISOString().split("T")[0],
          tatsbitData: {
            juz: parseInt(formData.tatsbitJuz),
            halamanDari: formData.tatsbitHalDari,
            halamanKe: formData.tatsbitHalKe,
            nilai: formData.tatsbitNilai,
          },
        };

        if (isOnline) {
          const res = await submitTatsbitData(payload.studentId, payload.dateStr, payload.tatsbitData);
          if (res.success) result = true;
          else showAlert("Gagal Menyimpan", "Gagal menyimpan data tatsbit: " + (res as any).error);
        } else {
          await addToSyncQueue("MutabaahDaily_Tatsbit", "update", payload);
          result = true;
        }
      }

      if (result) {
        setActiveModal(null);
        if (state.currentRole === "murid") fetchStudentData(selectedDate);
        else fetchData();
      }
    } catch (error) {
      console.error(error);
      showAlert("Error", "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Muroja'ah Partner & Tatsbit
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Jurnal evaluasi saling menyimak dan setoran penguatan hafalan
          </p>
        </div>
      </div>

      {/* Control Bar */}
      {["admin-tenant", "super-admin"].includes(state.currentRole || "") &&
        halaqahs.length > 0 && (
          <select
            value={selectedHalaqah}
            onChange={(e) => setSelectedHalaqah(e.target.value)}
            className="px-4 py-3 rounded-2xl border-none bg-white shadow-sm text-sm font-bold text-slate-700 outline-none cursor-pointer w-full"
          >
            {halaqahs.map((h) => (
              <option key={h._id} value={h._id}>
                Halaqah {h.name}
              </option>
            ))}
          </select>
        )}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder={
                state.currentRole === "murid"
                  ? "Cari histori Juz/Tanggal..."
                  : "Cari nama santri..."
              }
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white shadow-sm text-sm outline-none ring-2 ring-transparent focus:ring-sage-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-none bg-white shadow-sm text-sm outline-none ring-2 ring-transparent focus:ring-sage-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Tabel Murid: Data Partner (Jika Role = Murid) */}
      {state.currentRole === "murid" && muridPartnerData && (
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-sm mb-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                Tugas Partner Anda Hari Ini
              </span>
              <h2 className="text-xl font-black">
                {muridPartnerData.studentName}
              </h2>
              <p className="text-indigo-100 text-xs">
                Anda bertanggung jawab menyimak dan menginput Murojaah untuknya
              </p>
            </div>
          </div>

          {muridPartnerData.murojaahPartnerComplete ? (
            <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-indigo-100 text-xs block mb-1">
                  Status Hari Ini
                </span>
                <span className="font-bold">
                  <i className="fa-solid fa-check-circle text-emerald-300 mr-2"></i>{" "}
                  Disimak
                </span>
              </div>
              <div className="text-right">
                <span className="text-indigo-100 text-xs block mb-1">
                  Rentang Hafalan
                </span>
                <span className="font-bold">
                  Juz {muridPartnerData.murojaahPartnerJuz}, Hal{" "}
                  {muridPartnerData.murojaahPartnerDari}-
                  {muridPartnerData.murojaahPartnerKe}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openModal("partner", muridPartnerData)}
              className="rounded-2xl p-4 text-center bg-white text-indigo-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition active:scale-95 w-full"
            >
              Input Murojaah
            </button>
          )}
        </div>
      )}

      {/* Tabel Utama (Guru / Admin / Histori Murid) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Memuat data...
            </div>
          ) : studentsData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Belum ada data tersedia.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sage-50/70 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3 w-[80px]">
                    {state.currentRole === "murid" ? "Tanggal" : "Santri"}
                  </th>
                  <th className="px-4 py-3 text-center">Partner</th>
                  <th className="px-4 py-3 text-center">Tatsbit</th>
                  {state.currentRole === "guru" && (
                    <th className="px-4 py-3 text-center w-[40px]">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td
                      className="px-4 py-3 truncate max-w-[80px]"
                      title={item.studentName}
                    >
                      {state.currentRole === "murid" ? (
                        <span className="font-bold whitespace-nowrap">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      ) : (
                        <div>
                          <p className="font-bold text-slate-700 truncate">
                            {item.studentName}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                            P: {item.partnerName}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Kolom Murojaah Partner */}
                    <td
                      className={`px-4 py-3 text-center ${state.currentRole === "guru" ? "cursor-pointer hover:bg-slate-100" : ""}`}
                      onClick={() => {
                        if (state.currentRole === "guru")
                          openModal(
                            "partner",
                            item,
                            item.murojaahPartnerComplete,
                          );
                      }}
                    >
                      {item.murojaahPartnerComplete ? (
                        <span className="font-medium text-slate-700 whitespace-nowrap">
                          <i className="fa-solid fa-check-circle text-emerald-500 mr-1"></i>
                          {item.murojaahPartnerJuz}, {item.murojaahPartnerDari}-
                          {item.murojaahPartnerKe}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {/* Kolom Tatsbit */}
                    <td
                      className={`px-4 py-3 text-center ${state.currentRole === "guru" ? "cursor-pointer hover:bg-slate-100" : ""}`}
                      onClick={() => {
                        if (state.currentRole === "guru")
                          openModal("tatsbit", item, item.tatsbitComplete);
                      }}
                    >
                      {item.tatsbitComplete ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium text-blue-700 whitespace-nowrap">
                            {item.tatsbitJuz}, {item.tatsbitDari}-
                            {item.tatsbitKe}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${
                              item.tatsbitNilai.startsWith("A")
                                ? "bg-emerald-500"
                                : item.tatsbitNilai.startsWith("B")
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                            }`}
                          >
                            {item.tatsbitNilai}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {/* Kolom Aksi Khusus Guru */}
                    {state.currentRole === "guru" && (
                      <td className="px-2 py-3 text-center">
                        <div className="flex justify-center gap-2 text-slate-400">
                          <button
                            title="Reset Data"
                            className={`hover:text-red-500 transition ${!item.murojaahPartnerComplete && !item.tatsbitComplete ? "opacity-30 cursor-not-allowed" : ""}`}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3 className="text-xl font-black text-slate-800 mb-1">
              {editingItem ? "Edit Data" : "Input Data"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {activeModal === "partner" ? "Muroja'ah Partner" : "Tatsbit"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                  Juz
                </label>
                <input
                  type="number"
                  placeholder="Misal: 30"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-sage-500 transition text-sm font-bold text-slate-700"
                  value={
                    activeModal === "partner"
                      ? formData.partnerJuz
                      : formData.tatsbitJuz
                  }
                  onChange={(e) =>
                    setFormData((prev) =>
                      activeModal === "partner"
                        ? { ...prev, partnerJuz: e.target.value }
                        : { ...prev, tatsbitJuz: e.target.value },
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                    Halaman Dari
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 10a"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-sage-500 transition text-sm font-bold text-slate-700"
                    value={
                      activeModal === "partner"
                        ? formData.partnerHalDari
                        : formData.tatsbitHalDari
                    }
                    onChange={(e) =>
                      setFormData((prev) =>
                        activeModal === "partner"
                          ? { ...prev, partnerHalDari: e.target.value }
                          : { ...prev, tatsbitHalDari: e.target.value },
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                    Halaman Ke
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 15b"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-sage-500 transition text-sm font-bold text-slate-700"
                    value={
                      activeModal === "partner"
                        ? formData.partnerHalKe
                        : formData.tatsbitHalKe
                    }
                    onChange={(e) =>
                      setFormData((prev) =>
                        activeModal === "partner"
                          ? { ...prev, partnerHalKe: e.target.value }
                          : { ...prev, tatsbitHalKe: e.target.value },
                      )
                    }
                  />
                </div>
              </div>

              {activeModal === "tatsbit" && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                    Nilai Kelancaran
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-sage-500 transition text-sm font-bold text-slate-700"
                    value={formData.tatsbitNilai}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tatsbitNilai: e.target.value,
                      }))
                    }
                  >
                    {["A+", "A", "B+", "B", "B-", "C+", "C", "C-", "D"].map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleModalSubmit}
              disabled={isSubmitting}
              className="w-full mt-8 bg-sage-500 text-white font-bold py-3.5 rounded-2xl hover:bg-sage-600 transition shadow-lg shadow-sage-500/30 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </div>
      )}
      
      <AlertModal 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig(prev => ({...prev, isOpen: false}))}
      />
    </main>
  );
}
