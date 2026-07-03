"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, Role } from "@/context/AppContext";
import TopBar from "@/components/TopBar";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("murid");
  const { login } = useAppContext();
  const router = useRouter();

  const handleLogin = () => {
    login(selectedRole);
    router.push("/dashboard");
  };

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24 relative p-6 flex flex-col justify-between h-full min-h-[750px] page-transition">
        <div className="text-center pt-6">
          <span className="bg-sage-100 text-sage-700 text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">Sign In</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">Masuk Akun</h2>
          <p className="text-slate-500 text-sm mt-2">Pilih peran uji coba Anda untuk merasakan seluruh dasbor terpadu</p>
        </div>

        {/* Dynamic Role Selector for Demo purposes */}
        <div className="my-6 space-y-3">
          <label className="block text-slate-700 font-bold text-sm mb-1 text-center">Uji Coba Sebagai:</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: "super-admin", icon: "fa-user-shield", label: "Super-Admin" },
              { role: "admin-tenant", icon: "fa-school", label: "Admin Tenant" },
              { role: "guru", icon: "fa-chalkboard-user", label: "Ustadz / Guru" },
              { role: "murid", icon: "fa-user-graduate", label: "Santri / Murid" },
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => setSelectedRole(item.role as Role)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 text-xs font-bold transition border-2 ${
                  selectedRole === item.role
                    ? "bg-sage-500 border-sage-500 text-white shadow-lg shadow-sage-500/10"
                    : "bg-white border-sage-500/10 text-slate-700 hover:border-sage-500/30"
                }`}
              >
                <i className={`fa-solid ${item.icon} text-lg ${selectedRole === item.role ? "text-white" : "text-sage-500"}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pb-6">
          <button onClick={handleLogin} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-3 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.29 1.67l3.21-3.21C17.55 1.7 14.97 1 12 1 7.35 1 3.41 3.68 1.48 7.58l3.78 2.93c.9-2.7 3.41-4.47 6.74-4.47z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.3 3.49l3.58 2.78c2.1-1.94 3.3-4.8 3.3-8.42z"/>
              <path fill="#FBBC05" d="M5.26 14.51c-.24-.71-.38-1.47-.38-2.26 0-.79.14-1.55.38-2.26L1.48 7.06C.54 8.96 0 11.08 0 13.25c0 2.17.54 4.29 1.48 6.19l3.78-2.93z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.58-2.78c-.99.66-2.26 1.07-4.38 1.07-3.33 0-5.84-1.77-6.74-4.47L1.48 16.8A11.972 11.972 0 0 0 12 23z"/>
            </svg>
            <span>Masuk dengan Google</span>
          </button>
          <p className="text-center text-xs text-slate-400">
            Masuk otomatis mendeteksi tenant & ruang kelas Anda.
          </p>
        </div>
      </div>
    </>
  );
}
