"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";

export default function WelcomePage() {
  const [activeSlide, setActiveSlide] = useState(1);
  const router = useRouter();

  const nextSlide = () => {
    if (activeSlide < 3) {
      setActiveSlide(activeSlide + 1);
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24 relative p-6 flex flex-col justify-between h-full min-h-[750px]">
        {/* Header Logo */}
        <div className="text-center pt-4">
          <span className="bg-sage-100 text-sage-700 text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">
            Tahfidz Tracker
          </span>
          <h1 className="text-4xl font-extrabold text-sage-700 mt-2">
            Jaz<span className="text-sage-400">Quran</span>
          </h1>
        </div>

        {/* Carousel Body */}
        <div className="my-auto text-center px-4">
          {activeSlide === 1 && (
            <div className="carousel-slide flex flex-col items-center page-transition">
              <div className="w-48 h-48 bg-sage-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <svg
                  className="w-32 h-32 text-sage-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Sistem Mutabaah Digital
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Platform monitoring setoran Al-Qur'an secara real-time untuk
                mencetak generasi hafiz yang disiplin, berkarakter, dan mutqin.
              </p>
            </div>
          )}

          {activeSlide === 2 && (
            <div className="carousel-slide flex flex-col items-center page-transition">
              <div className="w-48 h-48 bg-sage-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <i className="fa-solid fa-users text-7xl text-sage-500"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                SOP Partner Muraja'ah
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Saling menguatkan hafalan bersama rekan sejawat. Ziyadah hari
                ini terkunci sebelum verifikasi partner diselesaikan.
              </p>
            </div>
          )}

          {activeSlide === 3 && (
            <div className="carousel-slide flex flex-col items-center page-transition">
              <div className="w-48 h-48 bg-sage-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <svg
                  className="w-32 h-32 text-sage-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Analisis Progres & Grafik
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Visualisasi diagram kemajuan mingguan, akumulasi juz, serta
                notifikasi ujian tatsbit dan siaran live tasmi otomatis.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setActiveSlide(num)}
                className={`w-2.5 h-2.5 rounded-full ${activeSlide === num ? "bg-sage-500" : "bg-sage-200"}`}
                aria-label={`Slide ${num}`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="bg-sage-500 hover:bg-sage-600 text-white font-semibold py-3.5 rounded-2xl transition shadow-lg shadow-sage-500/20 w-full flex items-center justify-center gap-2"
          >
            <span>Lanjutkan</span>
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </button>
          <button
            onClick={() => router.push("/login")}
            className="text-sage-700 hover:text-sage-800 font-bold text-sm py-2"
          >
            Lewati & Masuk
          </button>
        </div>
      </div>
    </>
  );
}
