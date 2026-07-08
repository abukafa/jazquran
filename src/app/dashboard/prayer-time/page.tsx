"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
}

export default function PrayerTimePage() {
  const [timings, setTimings] = useState<Timings | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [locationName, setLocationName] = useState("Mendeteksi lokasi...");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<{ id: string; name: string; time: string } | null>(null);

  useEffect(() => {
    const fetchLocationName = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`);
        const data = await res.json();
        if (data.city || data.locality || data.principalSubdivision) {
          const loc = [data.locality, data.city, data.principalSubdivision].filter(Boolean);
          // Remove duplicates if locality and city are same
          const uniqueLoc = Array.from(new Set(loc));
          return uniqueLoc.join(", ");
        }
      } catch(e) {
        console.error(e);
      }
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    };

    const fetchTimings = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=20`); // method 20 is Kemenag RI
        const json = await res.json();
        
        if (json.code === 200) {
          setTimings(json.data.timings);
          calculateNextPrayer(json.data.timings);
          const locName = await fetchLocationName(lat, lng);
          setLocationName(locName);
        } else {
          throw new Error("Gagal mengambil data dari API");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    const handleSuccess = (position: GeolocationPosition) => {
      fetchTimings(position.coords.latitude, position.coords.longitude);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn("Geolocation error:", error.message);
      setLocationName("Jakarta (Default - Akses Lokasi Ditolak)");
      // Fallback to Jakarta
      fetchTimings(-6.2088, 106.8456);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { timeout: 10000 });
    } else {
      setLocationName("Jakarta (Default - Geolocation tidak didukung)");
      fetchTimings(-6.2088, 106.8456);
    }
  }, []);

  const calculateNextPrayer = (t: Timings) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: "Fajr", time: t.Fajr },
      { name: "Dhuhr", time: t.Dhuhr },
      { name: "Asr", time: t.Asr },
      { name: "Maghrib", time: t.Maghrib },
      { name: "Isha", time: t.Isha }
    ];

    let found = false;
    let nPrayer = null;
    for (const p of prayers) {
      const [h, m] = p.time.split(":").map(Number);
      const pTime = h * 60 + m;
      if (pTime > currentTime) {
        nPrayer = p;
        found = true;
        break;
      }
    }

    if (!found) {
      // Next prayer is Fajr tomorrow
      nPrayer = { name: "Fajr", time: t.Fajr };
    }
    
    setNextPrayer(nPrayer);
    if (!selectedPrayer && nPrayer) {
      setSelectedPrayer({ id: nPrayer.name, name: nPrayer.name, time: nPrayer.time });
    }
  };

  const prayerList = timings ? [
    { id: "Imsak", label: "Imsak", time: timings.Imsak, icon: "fa-cloud-moon" },
    { id: "Fajr", label: "Subuh", time: timings.Fajr, icon: "fa-cloud-sun" },
    { id: "Sunrise", label: "Terbit", time: timings.Sunrise, icon: "fa-sun" },
    { id: "Dhuhr", label: "Dzuhur", time: timings.Dhuhr, icon: "fa-sun" },
    { id: "Asr", label: "Ashar", time: timings.Asr, icon: "fa-cloud-sun" },
    { id: "Maghrib", label: "Maghrib", time: timings.Maghrib, icon: "fa-moon" },
    { id: "Isha", label: "Isya", time: timings.Isha, icon: "fa-star" },
  ] : [];

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-800 flex items-center gap-2">
            <Link href="/dashboard" className="text-sage-500 hover:text-sage-700 transition">
              <i className="fas fa-arrow-left text-lg"></i>
            </Link>
            Jadwal Sholat
          </h1>
          <p className="text-sage-600 flex items-center gap-2 mt-1">
            <i className="fas fa-map-marker-alt"></i> {locationName}
          </p>
        </div>
      </div>

      {loading && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
        </div>
      )}

      {errorMsg && !loading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      {!loading && timings && (
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-gradient-to-br from-sage-600 to-sage-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 text-9xl -mt-4 -mr-4 pointer-events-none">
              <i className="fas fa-mosque"></i>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-sage-100 font-medium mb-2 uppercase tracking-widest text-sm">
                {selectedPrayer?.id === nextPrayer?.name ? "Sholat Selanjutnya" : "Jadwal Terpilih"}
              </h2>
              <div className="text-5xl font-bold mb-2">
                {selectedPrayer?.id === "Fajr" ? "Subuh" : 
                 selectedPrayer?.id === "Dhuhr" ? "Dzuhur" : 
                 selectedPrayer?.id === "Asr" ? "Ashar" : 
                 selectedPrayer?.id === "Maghrib" ? "Maghrib" : 
                 selectedPrayer?.id === "Isha" ? "Isya" : 
                 selectedPrayer?.id === "Imsak" ? "Imsak" : 
                 selectedPrayer?.id === "Sunrise" ? "Terbit" : selectedPrayer?.name}
              </div>
              <div className="text-4xl font-light text-sage-100">{selectedPrayer?.time}</div>
            </div>
          </div>

          {/* Time List */}
          <div className="bg-white rounded-3xl shadow-sm border border-sage-100 overflow-hidden divide-y divide-sage-50">
            {prayerList.map((item) => {
              const isSelected = selectedPrayer?.id === item.id;
              const isNext = nextPrayer?.name === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => setSelectedPrayer({ id: item.id, name: item.id, time: item.time })}
                  className={`w-full p-4 flex items-center justify-between transition-colors ${
                    isSelected ? "bg-sage-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isSelected ? "bg-sage-200 text-sage-700" : "bg-slate-100 text-slate-400"
                    }`}>
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold text-lg ${isSelected ? "text-sage-800" : "text-slate-600"}`}>
                        {item.label}
                      </h3>
                      {isNext && <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Selanjutnya</span>}
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${isSelected ? "text-sage-800" : "text-slate-500"}`}>
                    {item.time}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
