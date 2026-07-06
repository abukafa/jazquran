"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { getMyHalaqahs } from "@/actions/guru";
import { getZiyadahByDate, submitZiyadahData, getStudentZiyadahHistory } from "@/actions/ziyadah";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { addToSyncQueue } from "@/lib/localdb";
import { getPagesInJuz, calculateBinNadzorRange } from "@/lib/mushaf";
import AlertModal from "@/components/AlertModal";

export default function ZiyadahPage() {
  const { state } = useAppContext();
  const { isOnline } = useNetworkStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [halaqahs, setHalaqahs] = useState<any[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>("");
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: "alert"|"confirm", onConfirm: () => void}>({
    isOpen: false, title: "", message: "", type: "alert", onConfirm: () => {}
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ isOpen: true, title, message, type: "alert", onConfirm: () => setAlertConfig(prev => ({...prev, isOpen: false})) });
  };
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setAlertConfig({ isOpen: true, title, message, type: "confirm", onConfirm });
  };

  // Modals state
  const [activeModal, setActiveModal] = useState<
    "setoran" | "talaqqi" | "binnadzor" | null
  >(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
  );

  // Form state
  const [formData, setFormData] = useState({
    tanggal: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
    juz: 30,
    halamanDari: "1a",
    halamanKe: "1a",
    nilaiKelancaran: "A",
    talaqqiCount: 0,
  });

  const pagesCount = getPagesInJuz(formData.juz);
  const pageOptions = Array.from({ length: pagesCount }).flatMap((_, i) => [
    `${i + 1}a`,
    `${i + 1}b`,
  ]);

  useEffect(() => {
    if (state.currentRole === "admin-tenant" || state.currentRole === "super-admin") {
      fetchHalaqahs();
    } else if (state.currentRole === "murid") {
      setSelectedDate(""); // Clear date by default for murid to show history
    }
  }, [state.currentRole]);

  useEffect(() => {
    if (["admin-tenant", "super-admin"].includes(state.currentRole || "") && selectedHalaqah) {
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
    } else {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const hId = state.currentRole === "guru" ? undefined : selectedHalaqah;
    const res = await getZiyadahByDate(hId as any, selectedDate);
    if (res.success && res.data) {
      setStudentsData(res.data);
    }
    setIsLoading(false);
  };

  const fetchStudentData = async (dateFilter: string) => {
    setIsLoading(true);
    const res = await getStudentZiyadahHistory(dateFilter);
    if (res.success && res.data) {
      setStudentsData(res.data);
    }
    setIsLoading(false);
  };

  const filteredData = studentsData.filter((item) => {
    if (["guru", "admin-tenant", "super-admin"].includes(state.currentRole || "")) {
      return item.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const dateStr = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();
      return dateStr.includes(searchTerm.toLowerCase()) || (item.juz && item.juz.toString().includes(searchTerm.toLowerCase()));
    }
  });

  const openEditModal = (
    type: "setoran" | "talaqqi" | "binnadzor",
    item: any,
  ) => {
    // Penguncian: Setoran Ziyadah hanya bisa dibuka jika Murojaah Partner sudah selesai
    if (type === "setoran" && !item.murojaahPartnerComplete) {
      showAlert("Perhatian", `Mohon selesaikan Muroja'ah Partner untuk ${item.studentName} terlebih dahulu hari ini.`);
      return;
    }
    
    if (!["guru", "admin-tenant"].includes(state.currentRole || "")) return;
    setActiveModal(type);
    setSelectedStudent(item.studentId);

    setFormData({
      tanggal: selectedDate,
      juz: item.juz || 30,
      halamanDari: item.halamanDari || "1a",
      halamanKe: item.halamanKe || "1a",
      nilaiKelancaran: item.nilaiKelancaran || "A",
      talaqqiCount: item.talaqqiCount || 0,
    });

    if (type === "binnadzor" && item.binNadzorComplete) {
      setFormData((prev) => ({
        ...prev,
        juz: item.binNadzorJuz || 30,
        halamanDari: item.binNadzorHalamanDari || "1a",
        halamanKe: item.binNadzorHalamanKe || "1a",
      }));
    } else if (
      type === "binnadzor" &&
      item.hasSetoran &&
      !item.binNadzorComplete
    ) {
      const range = calculateBinNadzorRange(item.juz, item.halamanKe);
      if (range) {
        setFormData((prev) => ({
          ...prev,
          juz: range.juzDari,
          halamanDari: range.halDari,
          halamanKe: range.halKe,
        }));
      }
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !activeModal) return;

    const payload = {
      type: activeModal,
      isReset: true,
      tanggal: formData.tanggal,
      originalDateStr: selectedDate || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
    };

    setStudentsData((prev) =>
      prev.map((s) => {
        if (s.studentId === selectedStudent) {
          if (activeModal === "setoran") {
            return {
              ...s,
              hasSetoran: false,
              juz: null,
              halamanDari: null,
              halamanKe: null,
              nilaiKelancaran: null,
            };
          } else if (activeModal === "talaqqi") {
            return { ...s, talaqqiTakrir: false, talaqqiCount: 0 };
          } else if (activeModal === "binnadzor") {
            return {
              ...s,
              binNadzorComplete: false,
              binNadzorJuz: null,
              binNadzorHalamanDari: null,
              binNadzorHalamanKe: null,
            };
          }
        }
        return s;
      }),
    );

    setActiveModal(null);
    setSelectedStudent("");

    if (isOnline) {
      const res = await submitZiyadahData(selectedStudent, payload);
      if (!res.success) {
        showAlert("Gagal", "Gagal mereset ke server: " + res.error);
        fetchData();
      }
    } else {
      await addToSyncQueue("MutabaahDaily", "update", {
        studentId: selectedStudent,
        data: payload,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showAlert("Perhatian", "Pilih murid terlebih dahulu!");
      return;
    }

    const payload = {
      type: activeModal,
      originalDateStr: selectedDate || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
      ...formData,
    };

    // If they saved data for a different date than what's currently viewed,
    // switch the view to that new date so they can see their entry.
    if (formData.tanggal !== selectedDate) {
      setSelectedDate(formData.tanggal);
      setActiveModal(null);
      setSelectedStudent("");

      // We don't need optimistic update for the current view because we are switching views,
      // which will trigger a fresh fetch.
      if (isOnline) {
        const res = await submitZiyadahData(selectedStudent, payload);
        if (!res.success) showAlert("Gagal", "Gagal menyimpan ke server: " + res.error);
        fetchData();
      } else {
        await addToSyncQueue("MutabaahDaily", "update", {
          studentId: selectedStudent,
          data: payload,
        });
      }
      return;
    }

    // Optimistic UI update for current view
    setStudentsData((prev) =>
      prev.map((s) => {
        if (s.studentId === selectedStudent) {
          if (activeModal === "setoran") {
            return { ...s, hasSetoran: true, ...formData };
          } else if (activeModal === "talaqqi") {
            return {
              ...s,
              talaqqiTakrir: formData.talaqqiCount >= 20,
              talaqqiCount: formData.talaqqiCount,
            };
          } else if (activeModal === "binnadzor") {
            return {
              ...s,
              binNadzorComplete: true,
              binNadzorJuz: formData.juz,
              binNadzorHalamanDari: formData.halamanDari,
              binNadzorHalamanKe: formData.halamanKe,
            };
          }
        }
        return s;
      }),
    );

    setActiveModal(null);
    setSelectedStudent("");

    // PWA Offline-First Logic
    if (isOnline) {
      const res = await submitZiyadahData(selectedStudent, payload);
      if (!res.success) {
        showAlert("Gagal", "Gagal menyimpan ke server: " + res.error);
        fetchData(); // revert
      }
    } else {
      // Offline: Simpan ke IndexedDB
      await addToSyncQueue("MutabaahDaily", "update", {
        studentId: selectedStudent,
        data: payload,
      });
      console.log("Disimpan ke IndexedDB untuk sinkronisasi nanti");
    }
  };

  return (
    <div className="px-5 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-800">
          Mutabaah Ziyadah
        </h3>
        {!isOnline && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <i className="fa-solid fa-wifi-slash"></i> Offline
          </span>
        )}
      </div>

      {["admin-tenant", "super-admin"].includes(state.currentRole || "") && halaqahs.length > 0 && (
        <select
          value={selectedHalaqah}
          onChange={(e) => setSelectedHalaqah(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-sage-500 shadow-sm"
        >
          {halaqahs.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </select>
      )}

      {state.currentRole === "guru" && (
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              setActiveModal("talaqqi");
              setSelectedStudent("");
              setFormData({
                tanggal: selectedDate,
                juz: 30,
                halamanDari: "1a",
                halamanKe: "1a",
                nilaiKelancaran: "A",
                talaqqiCount: 0,
              });
            }}
            className="bg-white border border-sage-500/20 p-3 rounded-2xl flex flex-col items-center text-center gap-1 shadow-sm hover:border-sage-500 hover:bg-amber-50 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-book-open-reader text-sm"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-700">
              Talaqqi 20x
            </span>
          </button>
          <button
            onClick={() => {
              setActiveModal("setoran");
              setSelectedStudent("");
              setFormData({
                tanggal: selectedDate,
                juz: 30,
                halamanDari: "1a",
                halamanKe: "1a",
                nilaiKelancaran: "A",
                talaqqiCount: 0,
              });
            }}
            className="bg-white border border-sage-500/20 p-3 rounded-2xl flex flex-col items-center text-center gap-1 shadow-sm hover:border-sage-500 hover:bg-sage-50 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center text-sage-500">
              <i className="fa-solid fa-microphone-lines text-sm"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-700">
              Setoran Baru
            </span>
          </button>
          <button
            onClick={() => {
              setActiveModal("binnadzor");
              setSelectedStudent("");
              setFormData({
                tanggal: selectedDate,
                juz: 30,
                halamanDari: "1a",
                halamanKe: "1a",
                nilaiKelancaran: "A",
                talaqqiCount: 0,
              });
            }}
            className="bg-white border border-sage-500/20 p-3 rounded-2xl flex flex-col items-center text-center gap-1 shadow-sm hover:border-sage-500 hover:bg-blue-50 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <i className="fa-solid fa-eye text-sm"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-700">
              Bin-Nadzor
            </span>
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
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-[130px] bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sage-500/20 text-slate-600 font-medium"
        />
      </div>

      {["guru", "admin-tenant", "super-admin"].includes(state.currentRole || "") && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Memuat data santri...
              </div>
            ) : studentsData.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada data santri di halaqah ini.
              </div>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sage-50/70 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3">Santri</th>
                  <th className="px-4 py-3 text-center">20x</th>
                  <th className="px-4 py-3">Setor</th>
                  <th className="px-4 py-3 text-center">Nadzor</th>
                  <th className="px-4 py-3 text-center">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredData.map((item) => (
                  <tr
                    key={item.studentId}
                    className="hover:bg-slate-50 transition"
                  >
                    <td
                      className="px-4 py-3 font-small truncate max-w-[75px]"
                      title={item.studentName}
                    >
                      {item.studentName}
                    </td>
                    <td
                      className={`px-4 py-3 text-center ${["guru", "admin-tenant"].includes(state.currentRole || "") ? "cursor-pointer hover:bg-slate-100" : ""}`}
                      onClick={() => openEditModal("talaqqi", item)}
                    >
                      {item.talaqqiCount > 0 ? (
                        <span
                          className={`px-1 py-0.5 rounded-full font-small text-[10px] ${
                            item.talaqqiTakrir
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.talaqqiCount}
                        </span>
                      ) : (
                        <i className="fa-solid fa-minus text-slate-300"></i>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 ${["guru", "admin-tenant"].includes(state.currentRole || "") ? "cursor-pointer hover:bg-slate-100" : ""}`}
                      onClick={() => openEditModal("setoran", item)}
                    >
                      {item.hasSetoran ? (
                        <span className="text-sage-600 font-small">
                          {item.juz}:{item.halamanKe}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">- Belum -</span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-center ${["guru", "admin-tenant"].includes(state.currentRole || "") ? "cursor-pointer hover:bg-slate-100" : ""}`}
                      onClick={() => openEditModal("binnadzor", item)}
                    >
                      {item.binNadzorComplete ? (
                        <span className="text-blue-600 font-small">
                          {item.binNadzorHalamanDari}-{item.binNadzorHalamanKe}
                        </span>
                      ) : (
                        <i className="fa-solid fa-minus text-slate-300"></i>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.nilaiKelancaran ? (
                        <span
                          className={`px-2 py-0.5 rounded-full font-small text-[10px] ${
                            item.nilaiKelancaran.startsWith("A")
                              ? "bg-emerald-100 text-emerald-700"
                              : item.nilaiKelancaran.startsWith("B")
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.nilaiKelancaran}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </div>
      )}

      {state.currentRole === "murid" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Memuat riwayat mutabaah...
              </div>
            ) : studentsData.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada data mutabaah ziyadah.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sage-50/70 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3 text-center">20x</th>
                    <th className="px-4 py-3">Setor</th>
                    <th className="px-4 py-3 text-center">Nadzor</th>
                    <th className="px-4 py-3 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.talaqqiCount > 0 ? (
                          <span
                            className={`px-1 py-0.5 rounded-full font-small text-[10px] ${
                              item.talaqqiTakrir
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.talaqqiCount}
                          </span>
                        ) : (
                          <i className="fa-solid fa-minus text-slate-300"></i>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.hasSetoran ? (
                          <span className="text-sage-600 font-small">
                            {item.juz}:{item.halamanKe}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">- Belum -</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.binNadzorComplete ? (
                          <span className="text-blue-600 font-small">
                            {item.binNadzorHalamanDari}-{item.binNadzorHalamanKe}
                          </span>
                        ) : (
                          <i className="fa-solid fa-minus text-slate-300"></i>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.nilaiKelancaran ? (
                          <span
                            className={`px-2 py-0.5 rounded-full font-small text-[10px] ${
                              item.nilaiKelancaran.startsWith("A")
                                ? "bg-emerald-100 text-emerald-700"
                                : item.nilaiKelancaran.startsWith("B")
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.nilaiKelancaran}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-slate-800">
                {activeModal === "setoran" &&
                  (selectedStudent &&
                  studentsData.find((s) => s.studentId === selectedStudent)
                    ?.hasSetoran
                    ? "Edit Setoran Ziyadah"
                    : "Input Setoran Ziyadah")}
                {activeModal === "talaqqi" &&
                  (selectedStudent &&
                  studentsData.find((s) => s.studentId === selectedStudent)
                    ?.talaqqiCount > 0
                    ? "Edit Talaqqi Tikrar 20x"
                    : "Input Talaqqi Tikrar 20x")}
                {activeModal === "binnadzor" &&
                  (selectedStudent &&
                  studentsData.find((s) => s.studentId === selectedStudent)
                    ?.binNadzorComplete
                    ? "Edit Bin-Nadzor"
                    : "Input Bin-Nadzor")}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            {(() => {
              const currentStudent = studentsData.find(s => s.studentId === selectedStudent);
              const isEditMode = activeModal === "setoran" ? currentStudent?.hasSetoran 
                               : activeModal === "talaqqi" ? (currentStudent?.talaqqiCount || 0) > 0 
                               : activeModal === "binnadzor" ? currentStudent?.binNadzorComplete 
                               : false;
              
              return (
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                {state.currentRole === "admin-tenant" && (
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggal: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sage-400"
                    />
                  </div>
                )}
                <div className="flex-[2]">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Santri
                  </label>
                  {isEditMode ? (
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 font-medium cursor-not-allowed">
                      {currentStudent?.studentName}
                    </div>
                  ) : (
                      <select
                        required
                        value={selectedStudent}
                        onChange={(e) => {
                          const id = e.target.value;
                          const student = studentsData.find(
                            (s) => s.studentId === id,
                          );
                          if (student) openEditModal(activeModal as any, student);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sage-400"
                      >
                        <option value="" disabled>
                          -- Pilih Santri --
                        </option>
                        {studentsData.map((s) => (
                          <option key={s.studentId} value={s.studentId}>
                            {s.studentName}
                          </option>
                        ))}
                      </select>
                  )}
                </div>
              </div>

              {(activeModal === "setoran" || activeModal === "binnadzor") && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Juz
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        required
                        value={formData.juz}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            juz: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:border-sage-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Hal. Dari
                      </label>
                      <select
                        required
                        value={formData.halamanDari}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            halamanDari: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-sage-400"
                      >
                        {pageOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Hal. Ke
                      </label>
                      <select
                        required
                        value={formData.halamanKe}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            halamanKe: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-sage-400"
                      >
                        {pageOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {activeModal === "setoran" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Nilai Kelancaran
                      </label>
                      <select
                        value={formData.nilaiKelancaran}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nilaiKelancaran: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 focus:outline-none focus:border-sage-400"
                      >
                        <option value="A+">A+ (Sangat Lancar)</option>
                        <option value="A">A (Lancar)</option>
                        <option value="B+">B+ (Cukup Lancar)</option>
                        <option value="B">B (Kurang Lancar)</option>
                        <option value="C">C (Banyak Mengulang)</option>
                        <option value="D">D (Tidak Lulus)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {activeModal === "talaqqi" && (
                <div className="space-y-3">
                  <div className="bg-amber-50 p-3 rounded-xl text-amber-700 text-[10px] leading-relaxed">
                    <i className="fa-solid fa-circle-info mr-1"></i> Centang
                    kotak-kotak di bawah ini untuk mencatat progres Talaqqi &
                    Takrir (maks 20 kali).
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const newCount = formData.talaqqiCount || 0;
                          setFormData({
                            ...formData,
                            talaqqiCount: newCount === i + 1 ? i : i + 1,
                          });
                        }}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center font-bold text-xs transition ${
                          (formData.talaqqiCount || 0) > i
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                {selectedStudent &&
                  (() => {
                    const student = studentsData.find(
                      (s) => s.studentId === selectedStudent,
                    );
                    const showReset =
                      activeModal === "setoran"
                        ? student?.hasSetoran
                        : activeModal === "talaqqi"
                          ? student?.talaqqiCount > 0
                          : student?.binNadzorComplete;
                    return showReset ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 px-4 rounded-xl text-sm transition"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    ) : null;
                  })()}
                <button
                  type="submit"
                  disabled={
                    activeModal === "talaqqi" &&
                    (formData.talaqqiCount || 0) === 0
                  }
                  className="flex-1 bg-sage-500 hover:bg-sage-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition"
                >
                  {isEditMode ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
            );
          })()}
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
    </div>
  );
}
