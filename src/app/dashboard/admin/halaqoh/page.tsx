"use client";

import React, { useState, useEffect } from "react";
import {
  getHalaqahs,
  createHalaqah,
  updateHalaqah,
  deleteHalaqah,
  getGurus,
  getStudentsByHalaqah,
  addStudentToHalaqah,
  removeStudentFromHalaqah,
  setStudentPartner,
  getAvailableMurids,
} from "@/actions/halaqah";
import Link from "next/link";

export default function HalaqohPage() {
  const [halaqahs, setHalaqahs] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [guruId, setGuruId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmHalaqah, setDeleteConfirmHalaqah] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Student states for edit modal
  const [students, setStudents] = useState<any[]>([]);
  const [availableMurids, setAvailableMurids] = useState<any[]>([]);
  const [selectedMurid, setSelectedMurid] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  const loadStudentsForHalaqah = async (halaqahId: string) => {
    const res = await getStudentsByHalaqah(halaqahId);
    if (res.success && res.students) {
      setStudents(res.students);
    }
  };

  const loadAvailableMurids = async () => {
    const res = await getAvailableMurids();
    if (res.success && res.users) {
      setAvailableMurids(res.users);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    const [hRes, gRes] = await Promise.all([getHalaqahs(), getGurus()]);
    if (hRes.success && hRes.halaqahs) setHalaqahs(hRes.halaqahs);
    if (gRes.success && gRes.gurus) setGurus(gRes.gurus);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentId("");
    setName("");
    setGuruId("");
    setIsModalOpen(true);
  };

  const openEditModal = (h: any) => {
    setModalMode("edit");
    setCurrentId(h._id);
    setName(h.name);
    setGuruId(h.guruId);
    setStudents([]);
    loadStudentsForHalaqah(h._id);
    loadAvailableMurids();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("guruId", guruId);

    let res;
    if (modalMode === "add") {
      res = await createHalaqah(formData);
    } else {
      formData.append("id", currentId);
      res = await updateHalaqah(formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMurid) return;
    setIsAddingStudent(true);
    const formData = new FormData();
    formData.append("halaqahId", currentId);
    formData.append("userId", selectedMurid);

    const res = await addStudentToHalaqah(formData);
    if (res.success) {
      setSelectedMurid("");
      await loadStudentsForHalaqah(currentId);
      await loadAvailableMurids();
      loadData(); // refresh count
    } else {
      alert(res.error);
    }
    setIsAddingStudent(false);
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    setDeleteConfirmStudent({ id: studentId, name: studentName });
  };

  const confirmRemoveStudent = async () => {
    if (!deleteConfirmStudent) return;
    const res = await removeStudentFromHalaqah(deleteConfirmStudent.id);
    if (res.success) {
      await loadStudentsForHalaqah(currentId);
      await loadAvailableMurids();
      loadData();
    } else {
      alert(res.error);
    }
    setDeleteConfirmStudent(null);
  };

  const handleSetPartner = async (studentId: string, partnerId: string) => {
    const res = await setStudentPartner(studentId, partnerId);
    if (res.success) {
      await loadStudentsForHalaqah(currentId);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmHalaqah({ id, name });
  };

  const confirmDeleteHalaqah = async () => {
    if (!deleteConfirmHalaqah) return;
    const res = await deleteHalaqah(deleteConfirmHalaqah.id);
    if (res.success) {
      loadData();
    } else {
      alert(res.error);
    }
    setDeleteConfirmHalaqah(null);
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/profile"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Kelola Halaqah
            </h1>
            <p className="text-xs text-slate-500">
              Manajemen rombongan belajar
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Tambah
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Memuat data...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sage-50/70 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3">Halaqah</th>
                  <th className="px-4 py-3 text-center">Murid</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {halaqahs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Belum ada data halaqah.
                    </td>
                  </tr>
                ) : (
                  halaqahs.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-bold">{h.name}</div>
                          <div>{h.guruName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-sage-100 text-sage-700 px-2.5 py-1 rounded-full font-bold">
                          {h.studentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(h)}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(h._id, h.name)}
                          className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl animate-fade-in-up my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {modalMode === "add" ? "Tambah Halaqah" : "Edit Halaqah"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Halaqah */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Informasi Halaqah
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Nama Halaqah
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-sage-500"
                      placeholder="Contoh: Halaqah Al-Mulk"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Guru Pembimbing
                    </label>
                    <select
                      value={guruId}
                      onChange={(e) => setGuruId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-sage-500"
                      required
                    >
                      <option value="" disabled>
                        Pilih Guru
                      </option>
                      {gurus.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || gurus.length === 0}
                    className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Halaqah"}
                  </button>
                </form>
              </div>

              {/* Form Murid (Hanya Edit) */}
              {modalMode === "edit" && (
                <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Daftar Murid ({students.length})
                  </h3>

                  {/* Form Tambah Murid */}
                  <form
                    onSubmit={handleAddStudent}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4"
                  >
                    <div className="flex gap-2">
                      <select
                        value={selectedMurid}
                        onChange={(e) => setSelectedMurid(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                        required
                      >
                        <option value="" disabled>
                          Pilih Murid
                        </option>
                        {availableMurids.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={isAddingStudent || !selectedMurid}
                        className="bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition shrink-0"
                      >
                        {isAddingStudent ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-plus"></i>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* List Murid */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {students.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Belum ada murid di halaqah ini.
                      </p>
                    ) : (
                      students.map((s) => (
                        <div
                          key={s._id}
                          className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm text-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-slate-800">
                                {s.nama}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(s._id, s.nama)}
                              className="text-rose-400 hover:text-rose-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-rose-50 transition"
                              title="Keluarkan dari halaqah"
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Halaqah */}
      {deleteConfirmHalaqah && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 mb-2">
              Hapus Halaqah?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Yakin ingin menghapus halaqah "
              <span className="font-bold text-slate-700">
                {deleteConfirmHalaqah.name}
              </span>
              "? Murid di dalamnya tidak akan terhapus, namun statusnya akan
              menjadi belum berhalaqah.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmHalaqah(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteHalaqah}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Remove Student */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="fa-solid fa-user-minus"></i>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 mb-2">
              Keluarkan Murid?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Yakin ingin mengeluarkan "
              <span className="font-bold text-slate-700">
                {deleteConfirmStudent.name}
              </span>
              " dari halaqah ini?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={confirmRemoveStudent}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition"
              >
                Keluarkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
