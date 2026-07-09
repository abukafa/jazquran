"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudentHeatmap } from "@/actions/streak";

export default function StreakDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    studentName: string;
    heatmapData: any[];
  } | null>(null);

  useEffect(() => {
    if (studentId) {
      getStudentHeatmap(studentId)
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [studentId]);

  const getHeatmapColor = (frequency: number) => {
    if (frequency === 0) return "bg-slate-100";
    if (frequency === 1) return "bg-[#2d7a60]/15"; // approx rgba(45,122,96,0.15)
    if (frequency === 2) return "bg-[#2d7a60]/35";
    if (frequency === 3) return "bg-[#2d7a60]/55";
    if (frequency === 4) return "bg-[#2d7a60]/70";
    if (frequency === 5) return "bg-[#2d7a60]/85";
    if (frequency === 6) return "bg-[#2d7a60]/95";
    return "bg-slate-900 text-white";
  };

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="px-5 pt-6 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              {data?.studentName || "Memuat..."}
            </h1>
            <p className="text-xs text-slate-500">Peta Intensitas Bacaan</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-circle-notch fa-spin text-slate-400 text-3xl"></i>
          </div>
        ) : !data || data.heatmapData.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
            <i className="fa-solid fa-box-open text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500 text-sm font-semibold">
              Belum ada riwayat hafalan
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.heatmapData.map((juzData: any) => (
              <div
                key={juzData.juz}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-700">
                    Juz {juzData.juz}
                  </h3>
                  <span className="text-xs font-extrabold text-sage-600 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-100">
                    {juzData.completionPercentage}%
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {/* Row 1: Pages 1-10 */}
                  <div className="grid grid-cols-10 gap-1">
                    {juzData.pages.slice(0, 10).map((page: any) => (
                      <div
                        key={page.pageNumber}
                        title={`Hal ${page.pageNumber}: ${page.frequency}x dibaca`}
                        className={`aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold ${getHeatmapColor(page.frequency)} ${page.frequency > 6 ? "text-white" : "text-transparent hover:text-slate-500"} transition-all`}
                      >
                        {page.pageNumber}
                      </div>
                    ))}
                  </div>
                  {/* Row 2: Pages 11-20 */}
                  <div className="grid grid-cols-10 gap-1">
                    {juzData.pages.slice(10, 20).map((page: any) => (
                      <div
                        key={page.pageNumber}
                        title={`Hal ${page.pageNumber}: ${page.frequency}x dibaca`}
                        className={`aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold ${getHeatmapColor(page.frequency)} ${page.frequency > 6 ? "text-white" : "text-transparent hover:text-slate-500"} transition-all`}
                      >
                        {page.pageNumber}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-2 items-center justify-center text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-100"></div>0x
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#2d7a60]/15"></div>1x
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#2d7a60]/35"></div>2x
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#2d7a60]/55"></div>3x
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#2d7a60]/95"></div>5+
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
