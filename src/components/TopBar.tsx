"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function TopBar() {
  const { state, setOnline } = useAppContext();
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-sage-600 text-white px-5 pt-3 pb-2 text-xs flex justify-between items-center z-50 shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-cloud-sun"></i>
        <span className="font-semibold">{time || "12:00 PM"}</span>
      </div>
      {/* INDIKATOR OFFLINE */}
      <div className="flex items-center gap-2">
        <span className="mb-0.5">{state.isOnline ? "ONLINE" : "OFFLINE"}</span>
        <div
          className={`w-3 h-3 rounded-full ${
            state.isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
      </div>
    </div>
  );
}
