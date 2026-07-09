"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getTenants } from "@/actions/admin";
import { getHalaqahs } from "@/actions/halaqah";
import { getStreakList } from "@/actions/streak";
import { useSession } from "next-auth/react";

export default function StreakPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const userTenantId = (session?.user as any)?.tenantId;

  const [tenants, setTenants] = useState<any[]>([]);
  const [halaqahs, setHalaqahs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>("all");

  useEffect(() => {
    if (role === "super-admin") {
      getTenants().then((res) => {
        if (res.tenants) {
          setTenants(res.tenants);
          if (res.tenants.length > 0) {
            setSelectedTenant(res.tenants[0]._id);
          }
        }
      });
    } else if (userTenantId) {
      setSelectedTenant(userTenantId);
    }
  }, [role, userTenantId]);

  useEffect(() => {
    if (selectedTenant) {
      // Need to fetch halaqahs for this tenant.
      // The existing getHalaqahs() action checks session for admin-tenant, so it might fail for super-admin or murid.
      // For now we assume getHalaqahs works, or we will just skip halaqah filter if not available.
      // Actually we will fetch streak list directly with the tenant.
      fetchStreakData();
    }
  }, [selectedTenant, selectedHalaqah]);

  const fetchStreakData = async () => {
    setLoading(true);
    try {
      if (selectedTenant) {
        const data = await getStreakList(
          selectedTenant,
          selectedHalaqah === "all" ? undefined : selectedHalaqah,
        );
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const formatName = (name: string) => {
    if (name.length >= 20) {
      const words = name.split(" ");
      if (words.length > 2) {
        return words.slice(0, 2).join(" ") + "...";
      }
    }
    return name;
  };

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="px-5 mt-4 space-y-4">
        <div className="flex items-center justify-between mx-2">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Halaqah Streak
            </h1>
            <p className="text-xs text-slate-500">
              Analisis Konsistensi & Hafalan
            </p>
          </div>
          <Link
            href="/dashboard/graph"
            className="bg-sage-400 hover:bg-sage-500 text-white font-semibold py-1 px-3 rounded-xl transition shadow-sm shadow-sage-500/20 cursor-pointer text-sm flex items-center gap-1"
          >
            Graph
            <i className="fa-solid fa-arrow-right ml-2"></i>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          {role === "super-admin" && (
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">
                Cabang
              </label>
              <select
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-sage-500"
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
              >
                {tenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Note: Halaqah dropdown logic can be expanded here if we implement getHalaqahsByTenant action */}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10">
              <i className="fa-solid fa-circle-notch fa-spin text-slate-400 text-2xl"></i>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-100">
              <p className="text-slate-400 text-sm">Belum ada data santri</p>
            </div>
          ) : (
            students.map((student) => (
              <Link
                key={student.id}
                href={`/dashboard/streak/${student.id}`}
                className="block"
              >
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover border border-sage-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center font-extrabold text-lg border border-sage-100">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {formatName(student.name)}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total Hafalan:{" "}
                        <span className="font-bold text-slate-700">
                          {student.totalJuz} Juz
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex flex-col items-center justify-center ${student.streak > 0 ? "bg-orange-50" : "bg-slate-100"} rounded-2xl px-4 py-2 border border-orange-100`}
                  >
                    <i
                      className={`fa-solid fa-fire ${student.streak > 0 ? "text-orange-500" : "text-slate-400"} text-lg mb-0.5`}
                    ></i>
                    <span
                      className={`text-xs font-extrabold ${student.streak > 0 ? "text-orange-500" : "text-slate-400"}`}
                    >
                      {student.streak} Hari
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
