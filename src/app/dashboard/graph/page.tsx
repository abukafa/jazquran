"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  getMuridAnalytics,
  getGuruAnalytics,
  getAdminAnalytics,
  getSuperAdminAnalytics,
} from "@/actions/graph";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function GraphPage() {
  const { state } = useAppContext();
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const role = state.currentRole;
      let res: any = null;

      const userId = (session?.user as any)?.id;
      const tenantId = (session?.user as any)?.tenantId;

      if (role === "super-admin") {
        res = await getSuperAdminAnalytics();
      } else if (role === "admin-tenant" && tenantId) {
        res = await getAdminAnalytics(tenantId);
      } else if (role === "guru" && userId) {
        res = await getGuruAnalytics(userId);
      } else if (role === "murid" && userId) {
        res = await getMuridAnalytics(userId);
      }

      if (res && res.success) {
        setData(res);
      }
      setIsLoading(false);
    }

    if (state.currentRole && session) {
      fetchData();
    }
  }, [state.currentRole, session]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">Memuat analitik...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">
        Gagal memuat analitik.
      </div>
    );
  }

  const roleTitle =
    state.currentRole === "super-admin"
      ? "Statistik Global"
      : state.currentRole === "admin-tenant"
        ? "Statistik Cabang"
        : state.currentRole === "guru"
          ? "Statistik Halaqah"
          : "Statistik Pribadi";

  return (
    <div className="px-5 mt-4 space-y-4 pb-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">
            Analisis Progres
          </h3>
          <p className="text-xs text-slate-500">{roleTitle}</p>
        </div>
        <Link
          href="/dashboard/streak"
          className="bg-sage-400 hover:bg-sage-500 text-white font-semibold py-1 px-3 rounded-xl transition shadow-sm shadow-sage-500/20 cursor-pointer text-sm flex items-center gap-1"
        >
          Streak
          <i className="fa-solid fa-arrow-right ml-2"></i>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {state.currentRole === "super-admin" ? "Cabang" : "Ziyadah"}
          </span>
          <span className="text-lg font-black text-sage-500">
            {state.currentRole === "super-admin"
              ? data.stats.tenants
              : data.stats.ziyadah}
          </span>
          <span className="text-[9px] text-slate-400 block">
            {state.currentRole === "super-admin"
              ? "Tenant Aktif"
              : "Total Setoran"}
          </span>
        </div>
        <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {state.currentRole === "super-admin" ? "Halaqah" : "Muroja'ah"}
          </span>
          <span className="text-lg font-black text-amber-500">
            {state.currentRole === "super-admin"
              ? data.stats.halaqahs
              : data.stats.murojaah}
          </span>
          <span className="text-[9px] text-slate-400 block">
            {state.currentRole === "super-admin" ? "Halaqah Aktif" : "Partner"}
          </span>
        </div>
        <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {state.currentRole === "super-admin" ? "Santri" : "Tatsbit"}
          </span>
          <span className="text-lg font-black text-blue-500">
            {state.currentRole === "super-admin"
              ? data.stats.students
              : data.stats.tatsbit}
          </span>
          <span className="text-[9px] text-slate-400 block">
            {state.currentRole === "super-admin"
              ? "Total Santri"
              : "Penyimak Guru"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-3">
          Aktivitas Harian (7 Hari Terakhir)
        </h4>
        <div className="h-44 w-full">
          <Line
            data={{
              labels: data.dailyChart.labels,
              datasets: data.dailyChart.datasets.map((ds: any, i: number) => ({
                ...ds,
                borderColor:
                  i === 0 ? "#2D7A60" : i === 1 ? "#F59E0B" : "#3B82F6",
                backgroundColor:
                  i === 0 ? "#D1E5DB" : i === 1 ? "#FEF3C7" : "#DBEAFE",
                tension: 0.4,
                fill: false,
              })),
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>

      {state.currentRole === "super-admin" && data.barChart && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm mb-3">
            Top 5 Cabang (Jml Santri)
          </h4>
          <div className="h-44 w-full">
            <Bar
              data={{
                labels: data.barChart.labels,
                datasets: [
                  {
                    label: "Jumlah Santri",
                    data: data.barChart.data,
                    backgroundColor: "#2D7A60",
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-3">
          Distribusi Nilai Kelancaran
        </h4>
        <div className="h-44 w-full flex justify-center items-center">
          {data.doughnutChart.data.every((val: number) => val === 0) ? (
            <span className="text-sm text-slate-400 font-medium italic">
              Belum ada data Kelancaran Ziyadah
            </span>
          ) : (
            <Doughnut
              data={{
                labels: data.doughnutChart.labels,
                datasets: [
                  {
                    data: data.doughnutChart.data,
                    backgroundColor: ["#2D7A60", "#679E83", "#D1E5DB"],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
