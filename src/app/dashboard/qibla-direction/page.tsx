"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function QiblaDirectionPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [locationName, setLocationName] = useState("Mendeteksi lokasi...");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [hasCompass, setHasCompass] = useState(false);

  useEffect(() => {
    const fetchLocationName = async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
        );
        const data = await res.json();
        if (data.city || data.locality || data.principalSubdivision) {
          const loc = [
            data.locality,
            data.city,
            data.principalSubdivision,
          ].filter(Boolean);
          // Remove duplicates
          const uniqueLoc = Array.from(new Set(loc));
          return uniqueLoc.join(", ");
        }
      } catch (e) {
        console.error(e);
      }
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    };

    const fetchQibla = async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/qibla/${lat}/${lng}`,
        );
        const json = await res.json();

        if (json.code === 200) {
          setQiblaDirection(json.data.direction);
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
      fetchQibla(position.coords.latitude, position.coords.longitude);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn("Geolocation error:", error.message);
      setLocationName("Jakarta (Default - Akses Lokasi Ditolak)");
      // Fallback to Jakarta
      fetchQibla(-6.2088, 106.8456);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        timeout: 10000,
      });
    } else {
      setLocationName("Jakarta (Default - Geolocation tidak didukung)");
      fetchQibla(-6.2088, 106.8456);
    }

    // Check if device orientation needs permission (iOS 13+)
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      setNeedsPermission(true);
    } else {
      // Start listening directly for non-iOS or older devices
      startCompass();
    }

    return () => {
      (window as any).removeEventListener(
        "deviceorientationabsolute",
        handleOrientation as EventListener,
      );
      (window as any).removeEventListener(
        "deviceorientation",
        handleOrientation as EventListener,
      );
    };
  }, []);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      let heading = 0;
      // @ts-ignore
      if (event.webkitCompassHeading) {
        // @ts-ignore
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // standard deviceorientation API
        heading = 360 - event.alpha;
      }
      setDeviceHeading(heading);
      if (!hasCompass) setHasCompass(true);
    },
    [hasCompass],
  );

  const startCompass = useCallback(() => {
    if (typeof window !== "undefined") {
      if ("ondeviceorientationabsolute" in window) {
        (window as any).addEventListener(
          "deviceorientationabsolute",
          handleOrientation as EventListener,
        );
      } else {
        (window as any).addEventListener(
          "deviceorientation",
          handleOrientation as EventListener,
        );
      }
    }
  }, [handleOrientation]);

  const requestAccess = async () => {
    try {
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission === "granted") {
          setNeedsPermission(false);
          startCompass();
        } else {
          alert("Izin sensor kompas ditolak.");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate the rotation of the compass face and the needle
  const qiblaRotation =
    qiblaDirection !== null ? qiblaDirection - deviceHeading : 0;

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-800 flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sage-500 hover:text-sage-700 transition"
            >
              <i className="fas fa-arrow-left text-lg"></i>
            </Link>
            Arah Kiblat
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

      {!loading && qiblaDirection !== null && (
        <div className="flex flex-col items-center max-w-lg mx-auto bg-white rounded-3xl p-8 shadow-sm border border-sage-100">
          {needsPermission && (
            <div className="mb-8 text-center bg-sage-50 p-4 rounded-xl w-full">
              <p className="text-sage-700 text-sm mb-3">
                Browser Anda membutuhkan izin untuk menggunakan Sensor Kompas.
              </p>
              <button
                onClick={requestAccess}
                className="bg-sage-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-sage-700"
              >
                Aktifkan Sensor Kompas
              </button>
            </div>
          )}

          {!hasCompass && !needsPermission && (
            <div className="mb-6 text-center text-amber-600 bg-amber-50 p-3 rounded-lg text-sm w-full">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Sensor kompas tidak terdeteksi pada perangkat ini (biasanya hanya
              di HP). Arah di bawah adalah arah statis dari Utara.
            </div>
          )}

          {/* Compass Graphic */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 rounded-full border-4 border-sage-200 shadow-inner bg-sage-50 overflow-hidden flex items-center justify-center">
            {/* North Marker */}
            <div
              className="absolute w-full h-full transition-transform duration-200 ease-out flex flex-col items-center"
              style={{ transform: `rotate(${-deviceHeading}deg)` }}
            >
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-red-500 mt-2"></div>
              <div className="text-red-500 font-bold mt-1 text-sm">U</div>
            </div>

            {/* Compass Rings */}
            <div className="absolute w-[90%] h-[90%] rounded-full border border-sage-300 opacity-50 border-dashed"></div>
            <div className="absolute w-[60%] h-[60%] rounded-full border border-sage-300 opacity-50"></div>

            {/* Kaaba Direction Needle */}
            <div
              className="absolute w-full h-full transition-transform duration-200 ease-out flex flex-col items-center justify-start py-4"
              style={{ transform: `rotate(${qiblaRotation}deg)` }}
            >
              {/* Kaaba Icon/Needle */}
              <div className="w-12 h-16 bg-slate-800 rounded shadow-lg flex flex-col items-center relative overflow-hidden">
                <div className="w-full h-2 bg-amber-500 mt-3 absolute top-0"></div>{" "}
                {/* Kaaba gold band */}
                <div className="w-full h-1 bg-amber-500 mt-1 absolute top-4"></div>
              </div>
              <div className="w-1 h-32 bg-sage-600 -mt-2 opacity-50"></div>
            </div>

            {/* Center dot */}
            <div className="absolute w-4 h-4 bg-sage-600 rounded-full z-10 shadow border-2 border-white"></div>
          </div>

          <div className="text-center w-full space-y-4">
            <h2 className="text-3xl font-bold text-sage-800">
              {qiblaDirection.toFixed(2)}°
            </h2>
            <p className="text-sage-600 uppercase tracking-widest text-sm font-medium">
              Arah dari Utara
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-sage-50 p-4 rounded-xl border border-sage-100">
                <p className="text-xs text-sage-500 mb-1">Kemiringan</p>
                <p className="font-bold text-sage-700">
                  {deviceHeading.toFixed(1)}°
                </p>
              </div>
              <div className="bg-sage-50 p-4 rounded-xl border border-sage-100">
                <p className="text-xs text-sage-500 mb-1">Status Sensor</p>
                <p
                  className={`font-bold ${hasCompass ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {hasCompass ? "Aktif" : "Statis"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
