import React from "react";

export interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "alert" | "confirm";
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  type = "alert",
  onConfirm,
  onCancel,
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 mt-4">
          {type === "confirm" && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition"
            >
              Batal
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-white font-bold rounded-2xl transition shadow-lg ${
              type === "alert"
                ? "bg-sage-500 hover:bg-sage-600 shadow-sage-500/30"
                : "bg-red-500 hover:bg-red-600 shadow-red-500/30"
            }`}
          >
            {type === "confirm" ? "Ya, Lanjutkan" : "Mengerti"}
          </button>
        </div>
      </div>
    </div>
  );
}
