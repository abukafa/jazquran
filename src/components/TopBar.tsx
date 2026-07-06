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
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOnline(!state.isOnline)}
          className={`${state.isOnline ? "bg-emerald-400" : "bg-white/40"} text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:opacity-90 transition`}
        >
          {state.isOnline && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping mr-1"></span>
          )}
          <span>{state.isOnline ? "ONLINE" : "OFFLINE"}</span>
        </button>
        {state.syncQueue.length > 0 && (
          <div className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
            <i className="fa-solid fa-rotate animate-spin"></i>{" "}
            <span>{state.syncQueue.length}</span> Sync
          </div>
        )}
      </div>
    </div>
  );
}
