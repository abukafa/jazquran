"use client";
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function GraphPage() {
  const chartRef1 = useRef<HTMLCanvasElement>(null);
  const chartRef2 = useRef<HTMLCanvasElement>(null);
  const chartRef3 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let c1: Chart, c2: Chart, c3: Chart;

    if (chartRef1.current) {
      c1 = new Chart(chartRef1.current, {
        type: 'line',
        data: {
          labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'],
          datasets: [{
            label: 'Akumulasi Juz',
            data: [1, 2, 4, 5],
            borderColor: '#2D7A60',
            backgroundColor: '#D1E5DB',
            tension: 0.4,
            fill: true
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (chartRef2.current) {
      c2 = new Chart(chartRef2.current, {
        type: 'bar',
        data: {
          labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'],
          datasets: [
            { label: 'Ziyadah', data: [2, 3, 2, 4, 3], backgroundColor: '#2D7A60' },
            { label: 'Partner', data: [10, 10, 10, 10, 10], backgroundColor: '#E8F2ED' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (chartRef3.current) {
      c3 = new Chart(chartRef3.current, {
        type: 'doughnut',
        data: {
          labels: ['A (Sangat Lancar)', 'B (Lancar)', 'C (Kurang)'],
          datasets: [{
            data: [60, 30, 10],
            backgroundColor: ['#2D7A60', '#679E83', '#D1E5DB']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
      });
    }

    return () => {
      c1?.destroy();
      c2?.destroy();
      c3?.destroy();
    };
  }, []);

  return (
    <div className="px-5 space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-800">Analisis Progres</h3>
        <span className="bg-sage-100 text-sage-700 text-xs font-bold px-2.5 py-1 rounded-full">Statistik Santri</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Ziyadah</span>
          <span className="text-lg font-black text-sage-500">42</span>
          <span className="text-[9px] text-slate-400 block">Total Hal</span>
        </div>
        <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Muroja'ah</span>
          <span className="text-lg font-black text-amber-500">120</span>
          <span className="text-[9px] text-slate-400 block">Setor & Partner</span>
        </div>
        <div className="bg-white p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Tatsbit</span>
          <span className="text-lg font-black text-blue-500">15</span>
          <span className="text-[9px] text-slate-400 block">Halaman</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Grafik Jumlah Hafalan (Juz)</h4>
        <div className="h-44 w-full">
          <canvas ref={chartRef1}></canvas>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Ziyadah Harian vs Partner</h4>
        <div className="h-44 w-full">
          <canvas ref={chartRef2}></canvas>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Distribusi Nilai Kelancaran</h4>
        <div className="h-44 w-full">
          <canvas ref={chartRef3}></canvas>
        </div>
      </div>
    </div>
  );
}
