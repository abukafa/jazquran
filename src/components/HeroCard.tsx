"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";

export default function HeroCard() {
  const { state } = useAppContext();
  const role = state.currentRole;
  const student = state.students[0]; // mock active student

  const { data: session } = useSession();
  const userName = session?.user?.name || "Santri";
  const userImage = session?.user?.image;

  const [tenantName, setTenantName] = React.useState("Memuat Cabang...");
  const [tenantPeriod, setTenantPeriod] = React.useState("Memuat Periode...");

  const [hafalanSaatIni, setHafalanSaatIni] = React.useState("Belum ada data");
  const [sisaTarget, setSisaTarget] = React.useState("-");

  React.useEffect(() => {
    // Only fetch for roles that belong to a tenant
    if (role && role !== "super-admin") {
      import("@/actions/admin").then((mod) => {
        mod.getTenantInfo().then((res) => {
          if (res.success && res.tenant) {
            setTenantName(res.tenant.name);
            setTenantPeriod(res.tenant.period);
          } else {
            setTenantName("Cabang Tidak Ditemukan");
            setTenantPeriod("Semester Berjalan");
          }
        });
      });
    }

    if (role === "murid") {
      import("@/actions/ziyadah").then((mod) => {
        mod.getStudentZiyadahHistory().then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            const latest = res.data.find((d: any) => d.hasSetoran);
            if (latest) {
              setHafalanSaatIni(`Juz ${latest.juz}, Hal ${latest.halamanKe}`);

              const totalHafal = res.distinctJuzCount || 0;

              // Ide Sisa Target: Sisa halaman untuk khatam Juz tersebut
              // Biasanya 1 Juz = 20 halaman, asumsi nomor halaman relatif ke Juz (1-20)
              const match = latest.halamanKe.match(/^(\d+)/);
              if (match) {
                const halNum = parseInt(match[1]);
                if (halNum < 20) {
                  setSisaTarget(`${20 - halNum} Hal Selesai Juz ${latest.juz}`);
                } else {
                  setSisaTarget(
                    `Siap masuk Juz Baru (Sisa ${30 - totalHafal} Juz)`,
                  );
                }
              } else {
                setSisaTarget(`${30 - totalHafal} Juz menuju Khatam`);
              }
            }
          }
        });
      });
    }
  }, [role]);

  if (role === "super-admin") {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">
          <i className="fa-solid fa-server"></i>
        </div>
        <span className="bg-rose-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Super Administrator
        </span>
        <h2 className="text-xl font-black mt-2">Dasbor Kendali Pusat</h2>
        <p className="text-slate-400 text-xs mt-1">
          Sistem SaaS Multi-Tenant JazQuran
        </p>
      </div>
    );
  }

  if (role === "admin-tenant") {
    return (
      <div className="bg-gradient-to-br from-sage-500 to-sage-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 text-9xl">
          <i className="fa-solid fa-school"></i>
        </div>
        <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Admin Sekolah
        </span>
        <h2 className="text-xl font-black mt-2">{tenantName}</h2>
        <p className="text-sage-100 text-xs mt-1">{tenantPeriod}</p>
      </div>
    );
  }

  if (role === "guru") {
    return (
      <div className="bg-gradient-to-br from-sage-600 to-sage-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 text-9xl">
          <i className="fa-solid fa-chalkboard-user"></i>
        </div>
        <span className="bg-white text-emerald-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Guru Pengampu
        </span>
        <h2 className="text-xl font-black mt-2">{tenantName}</h2>
        <p className="text-sage-100 text-xs mt-1">{tenantPeriod}</p>
      </div>
    );
  }

  // default to murid
  return (
    <div className="bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 opacity-15 text-8xl">
        <i className="fa-solid fa-book-quran"></i>
      </div>
      <div className="flex items-center gap-3 mb-3 relative z-10">
        {userImage ? (
          <img
            src={userImage}
            className="w-12 h-12 rounded-full border-2 border-white/50 object-cover shadow-sm"
            alt="Profile"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border-2 border-white/50 shadow-sm flex items-center justify-center bg-sage-400 text-white font-bold text-lg">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
            Santri Alquran
          </span>
          <h2 className="text-base font-extrabold leading-tight">{userName}</h2>
        </div>
      </div>
      <div className="bg-white/10 rounded-2xl p-3 flex justify-between items-center text-xs relative z-10">
        <div>
          <span className="text-sage-100 block text-[10px]">
            Hafalan Saat Ini
          </span>
          <span className="font-bold text-sm">{hafalanSaatIni}</span>
        </div>
        <div className="text-right">
          <span className="text-sage-100 block text-[10px]">Sisa Target</span>
          <span className="font-bold text-sm">{sisaTarget}</span>
        </div>
      </div>
    </div>
  );
}
