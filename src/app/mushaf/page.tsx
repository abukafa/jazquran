"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Komponen untuk me-render satu halaman Mushaf sebagai Gambar (Image)
function MushafPage({ pageNumber }: { pageNumber: number }) {
  // Pad page number to 3 digits (e.g., "001", "045", "604")
  const paddedPage = String(pageNumber).padStart(3, "0");

  // Menggunakan repo GovarJabbar/Quran-PNG via jsdelivr CDN (Kualitas HD Mushaf Madinah)
  const imageUrl = `https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${paddedPage}.png`;

  return (
    <div className="w-full h-full flex justify-center bg-white relative select-none">
      <img
        src={imageUrl}
        alt={`Mushaf Halaman ${pageNumber}`}
        className="w-full h-full object-contain pointer-events-none"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

function MushafViewer() {
  const searchParams = useSearchParams();
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end"); // Optional, if we want to limit, but user wants all pages

  const initialStart = startParam ? parseInt(startParam, 10) : 1;
  const [currentPage, setCurrentPage] = useState(
    isNaN(initialStart) ? 1 : initialStart,
  );

  // Sync state if URL params change without reloading the whole window
  useEffect(() => {
    const sp = searchParams.get("start");
    if (sp) {
      const p = parseInt(sp, 10);
      if (!isNaN(p) && p >= 1 && p <= 604) {
        setCurrentPage(p);
      }
    }
  }, [searchParams]);

  // Swipe logic
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // In Quran (RTL), swiping left goes to the NEXT page. Swiping right goes to PREVIOUS page.
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleNext = () => {
    if (currentPage < 604) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div
      className="min-h-screen bg-[#F4F3ED] flex flex-col overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center max-w-4xl mx-auto w-full h-[calc(100vh-64px)] overflow-hidden bg-white shadow-xl">
        {/* Edge Nav - Prev (Kanan) - Because RTL, previous page is to the right */}
        <button
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="absolute right-0 top-0 bottom-0 w-16 md:w-24 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/10 to-transparent disabled:hidden group"
        ></button>

        {/* The Page Itself with simple fade/slide transition key */}
        <div key={currentPage} className="w-full h-full animate-fade-in">
          <MushafPage pageNumber={currentPage} />
        </div>

        {/* Edge Nav - Next (Kiri) - Because RTL, next page is to the left */}
        <button
          onClick={handleNext}
          disabled={currentPage >= 604}
          className="absolute left-0 top-0 bottom-0 w-16 md:w-24 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-black/10 to-transparent disabled:hidden group"
        ></button>
      </div>
    </div>
  );
}

export default function MushafMain() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
        </div>
      }
    >
      <MushafViewer />
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Suspense>
  );
}
