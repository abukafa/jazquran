"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "super-admin" | "admin-tenant" | "guru" | "murid" | null;

interface Student {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  totalJuz: number;
  currentJuz: number;
  currentHal: number;
  lastMurojaahPartnerDate: string;
  tartil: string;
}

interface Tenant {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

interface Mutabaah {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  date: string;
  juz: number;
  fromHal: number;
  toHal: number;
  score: string;
  binNadzor: boolean;
  matan: boolean;
}

interface AppState {
  currentRole: Role;
  isOnline: boolean;
  syncQueue: any[];
  students: Student[];
  tenants: Tenant[];
  mutabaahData: Mutabaah[];
}

interface AppContextType {
  state: AppState;
  login: (role: Role) => void;
  logout: () => void;
  setOnline: (status: boolean) => void;
  addMutabaah: (data: Omit<Mutabaah, "id">) => void;
}

const MOCK_STUDENTS: Student[] = [
  { id: "std-1", name: "Hamzah Dwi Nugroho", partnerId: "std-2", partnerName: "M. Eza Arrafi Riono", totalJuz: 16, currentJuz: 16, currentHal: 3, lastMurojaahPartnerDate: "2026-07-03", tartil: "Menengah" },
  { id: "std-2", name: "M. Eza Arrafi Riono", partnerId: "std-1", partnerName: "Hamzah Dwi Nugroho", totalJuz: 3, currentJuz: 3, currentHal: 12, lastMurojaahPartnerDate: "", tartil: "Awal" },
  { id: "std-3", name: "Berwin Ijlal Junior", partnerId: "std-4", partnerName: "Mirza Haby Nurjamal", totalJuz: 2, currentJuz: 28, currentHal: 5, lastMurojaahPartnerDate: "2026-07-03", tartil: "Awal" },
  { id: "std-4", name: "Mirza Haby Nurjamal", partnerId: "std-3", partnerName: "Berwin Ijlal Junior", totalJuz: 1, currentJuz: 30, currentHal: 8, lastMurojaahPartnerDate: "", tartil: "Akhir" },
  { id: "std-5", name: "Danar Zenadine Francouer", partnerId: "std-6", partnerName: "Khalifa Arridrla Raffasya", totalJuz: 7, currentJuz: 7, currentHal: 20, lastMurojaahPartnerDate: "2026-07-03", tartil: "Menengah" },
  { id: "std-6", name: "Khalifa Arridrla Raffasya", partnerId: "std-5", partnerName: "Danar Zenadine Francouer", totalJuz: 4, currentJuz: 29, currentHal: 10, lastMurojaahPartnerDate: "", tartil: "Menengah" }
];

const MOCK_TENANTS: Tenant[] = [
  { id: "ten-1", name: "Jaz Academy Jakarta", code: "jaz-jakarta", active: true },
  { id: "ten-2", name: "Jaz Academy Bandung", code: "jaz-bandung", active: true },
  { id: "ten-3", name: "Roudhotul Huffadz", code: "roudhotul-huffadz", active: false }
];

const DEFAULT_MUTABAAH: Mutabaah[] = [
  { id: "m-1", studentId: "std-1", studentName: "Hamzah Dwi Nugroho", type: "ziyadah", date: "2026-07-02", juz: 16, fromHal: 3, toHal: 4, score: "B", binNadzor: true, matan: true },
  { id: "m-2", studentId: "std-3", studentName: "Berwin Ijlal Junior", type: "ziyadah", date: "2026-07-02", juz: 28, fromHal: 12, toHal: 13, score: "A", binNadzor: false, matan: false },
  { id: "m-3", studentId: "std-5", studentName: "Danar Zenadine Francouer", type: "ziyadah", date: "2026-07-02", juz: 7, fromHal: 8, toHal: 9, score: "B", binNadzor: true, matan: true },
  { id: "m-4", studentId: "std-1", studentName: "Hamzah Dwi Nugroho", type: "tatsbit", date: "2026-07-02", juz: 16, fromHal: 1, toHal: 5, score: "A", binNadzor: true, matan: true },
  { id: "m-5", studentId: "std-5", studentName: "Danar Zenadine Francouer", type: "tatsbit", date: "2026-07-02", juz: 7, fromHal: 19, toHal: 20, score: "B+", binNadzor: true, matan: true }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentRole: null,
    isOnline: true,
    syncQueue: [],
    students: MOCK_STUDENTS,
    tenants: MOCK_TENANTS,
    mutabaahData: DEFAULT_MUTABAAH,
  });

  useEffect(() => {
    // Load from local storage if needed later
    const role = localStorage.getItem("jaz_role") as Role;
    if (role) {
      setState((prev) => ({ ...prev, currentRole: role }));
    }
  }, []);

  const login = (role: Role) => {
    localStorage.setItem("jaz_role", role || "");
    setState((prev) => ({ ...prev, currentRole: role }));
  };

  const logout = () => {
    localStorage.removeItem("jaz_role");
    setState((prev) => ({ ...prev, currentRole: null }));
  };

  const setOnline = (status: boolean) => {
    setState((prev) => ({ ...prev, isOnline: status }));
  };

  const addMutabaah = (data: Omit<Mutabaah, "id">) => {
    const newEntry = { ...data, id: "m-" + Date.now() };
    setState((prev) => ({
      ...prev,
      mutabaahData: [newEntry, ...prev.mutabaahData],
    }));
  };

  return (
    <AppContext.Provider value={{ state, login, logout, setOnline, addMutabaah }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
