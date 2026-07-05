"use client";

import React, { useState } from "react";
import { linkUserToTenant } from "@/actions/admin";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function OnboardingPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError("Masukkan Kode Cabang terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await linkUserToTenant(code);
      if (res.error) {
        setError(res.error);
      } else {
        // Force refresh session to get new tenantId
        await update();
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 justify-center max-w-md mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-link text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tautkan Akun Anda</h2>
        <p className="text-slate-500 text-sm mb-8">
          Anda belum tergabung ke Cabang (Tenant) manapun. Silakan masukkan Kode Cabang yang diberikan oleh admin Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: JAZ-XYZ"
              className="w-full text-center text-lg tracking-widest font-bold px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500 bg-slate-50 uppercase placeholder-slate-300"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              <i className="fa-solid fa-circle-exclamation mr-1"></i> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              "Verifikasi Kode"
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-400 text-xs font-semibold hover:text-slate-600 transition"
          >
            Bukan akun Anda? Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
