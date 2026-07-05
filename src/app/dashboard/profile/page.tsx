"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { getMyHalaqahs } from "@/actions/guru";

export default function ProfilePage() {
  const { state, logout } = useAppContext();
  const { data: session } = useSession();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [myHalaqahs, setMyHalaqahs] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  useEffect(() => {
    if (state.currentRole === "guru") {
      const fetchHalaqahs = async () => {
        const res = await getMyHalaqahs();
        if (res.success && res.halaqahs) {
          setMyHalaqahs(res.halaqahs);
        }
      };
      fetchHalaqahs();
    }
  }, [state.currentRole]);

  const handleLogout = async () => {
    logout();
    await signOut({ callbackUrl: "/login" });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const userName = session?.user?.name || "Pengguna Aktif";
  const userEmail = session?.user?.email || "Belum ada email";
  const userAvatar = session?.user?.image;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getVerifiedColor = (role: string | null) => {
    switch (role) {
      case "super-admin":
        return "text-rose-500";
      case "admin-tenant":
        return "text-amber-500";
      case "guru":
        return "text-emerald-500";
      default:
        return "text-blue-500";
    }
  };

  const verifiedColor = getVerifiedColor(state.currentRole);

  return (
    <div className="px-5 space-y-6 pb-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-sage-500 to-sage-600"></div>
        <div className="relative pt-6">
          {userAvatar && !imgError ? (
            <img
              src={userAvatar}
              className="w-20 h-20 rounded-full border-4 border-white mx-auto shadow-md object-cover"
              alt="Avatar"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white mx-auto shadow-md bg-sage-100 text-sage-600 flex items-center justify-center text-3xl font-extrabold">
              {getInitials(userName)}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-800 mt-2">{userName}</h3>
          <span className={`text-xs font-bold ${verifiedColor} uppercase`}>
            {state.currentRole}
          </span>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          {/* Pembungkus utama diubah menjadi flex agar ikon bisa didorong ke kanan */}
          <div className="flex items-center justify-between w-full">
            {/* Teks dibungkus dalam satu div tanpa flex items-center di level ini */}
            <div className="text-left min-w-0">
              <span className="text-[10px] text-slate-400 block mb-0.5">
                Email Terdaftar
              </span>
              <span
                className="text-xs font-bold text-slate-700 block truncate"
                title={userEmail}
              >
                {userEmail}
              </span>
            </div>

            {/* Ukuran ikon diperbesar (misal: text-sm atau text-base) */}
            <i
              className={`fa-solid fa-circle-check ${verifiedColor} text-md shrink-0`}
              title="Verified Account"
            ></i>
          </div>
        </div>
      </div>

      {(state.currentRole === "super-admin" ||
        state.currentRole === "admin-tenant") && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Panel Administrator
          </h4>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            {state.currentRole === "super-admin" && (
              <Link
                href="/dashboard/admin/tenants"
                className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition block text-left mb-3"
              >
                <span>
                  <i className="fa-solid fa-school mr-2"></i> Kelola Cabang /
                  Tenant
                </span>
                <i className="fa-solid fa-chevron-right"></i>
              </Link>
            )}
            {state.currentRole === "admin-tenant" && (
              <>
                <Link
                  href="/dashboard/admin/tenant-settings"
                  className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition block text-left mb-3"
                >
                  <span>
                    <i className="fa-solid fa-sliders mr-2"></i> Pengaturan
                    Cabang
                  </span>
                  <i className="fa-solid fa-chevron-right"></i>
                </Link>
                <Link
                  href="/dashboard/admin/halaqoh"
                  className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition block text-left mb-3"
                >
                  <span>
                    <i className="fa-solid fa-chalkboard-user mr-2"></i> Kelola
                    Halaqah
                  </span>
                  <i className="fa-solid fa-chevron-right"></i>
                </Link>
              </>
            )}
            <Link
              href="/dashboard/admin/users"
              className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition block text-left"
            >
              <span>
                <i className="fa-solid fa-users mr-2"></i> Manajemen Pengguna
              </span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </div>
        </div>
      )}

      {state.currentRole === "guru" && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Panel Guru
          </h4>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            {myHalaqahs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">
                Belum ada halaqah yang ditugaskan kepada Anda.
              </p>
            ) : (
              myHalaqahs.map((h) => (
                <Link
                  key={h._id}
                  href={`/dashboard/guru/halaqoh/${h._id}`}
                  className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold py-3 px-4 rounded-xl text-xs flex justify-between items-center transition block text-left"
                >
                  <span>
                    <i className="fa-solid fa-chalkboard-user mr-2"></i> Kelola{" "}
                    {h.name}
                  </span>
                  <i className="fa-solid fa-chevron-right"></i>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {isInstallable && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Aplikasi
          </h4>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              <i className="fa-solid fa-download"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Instal JazQuran
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Instal aplikasi ini ke perangkat Anda untuk akses lebih cepat dan
              penggunaan saat offline.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex justify-center items-center gap-2 transition"
            >
              <i className="fa-solid fa-mobile-screen"></i> Instal Aplikasi
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3.5 rounded-2xl transition text-xs flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Keluar dari Aplikasi</span>
        </button>
      </div>
    </div>
  );
}
