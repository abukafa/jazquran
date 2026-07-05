"use client";

import React, { useState, useEffect } from "react";
import { updateTenantSettings, getTenantInfo } from "@/actions/admin";
import Link from "next/link";

export default function TenantSettingsPage() {
  const [period, setPeriod] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [tenantData, setTenantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTenantInfo().then((res) => {
      if (res.success && res.tenant) {
        setTenantData(res.tenant);
        setPeriod(res.tenant.period);
        setName(res.tenant.name);
      }
      setIsLoading(false);
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("period", period);
    formData.append("name", name);

    const res = await updateTenantSettings(formData);
    if (res.success) {
      setSuccessMsg("Pengaturan berhasil disimpan.");
      // Force refresh data
      getTenantInfo().then((info) => {
        if (info.success && info.tenant) {
          setTenantData(info.tenant);
        }
      });
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="p-5 text-center text-slate-500">Memuat pengaturan...</div>
    );
  }

  const tenantName = tenantData?.name || "Cabang Anda";

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/profile"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">
            Pengaturan Cabang
          </h1>
          <p className="text-xs text-slate-500">{tenantName}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold border border-emerald-100 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-circle-check"></i> {successMsg}
          </div>
        )}

        {tenantData && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">
                  Kode Cabang
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(tenantData.code)}
                  className="inline-block bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-slate-700 transition-colors duration-150 cursor-pointer"
                  title="Klik untuk menyalin"
                >
                  {tenantData.code}
                </button>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">
                  Aktif Sejak
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {new Date(tenantData.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Instansi
            </label>
            <input
              type="text"
              placeholder="Contoh: Jaz Academy Jakarta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-sage-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Edit Periode Akademik
            </label>
            <input
              type="text"
              placeholder="Contoh: Semester Ganjil 2025/2026"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-sage-500"
              required
            />
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Teks ini akan ditampilkan di Dasbor seluruh murid dan guru di
              cabang Anda.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Simpan Pengaturan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
