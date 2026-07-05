"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentRole: null,
    isOnline: true,
    syncQueue: [],
    students: [],
    tenants: [],
    mutabaahData: [],
  });

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user && (session.user as any).role) {
      setState((prev) => ({ ...prev, currentRole: (session.user as any).role }));
    } else if (status === "unauthenticated") {
      setState((prev) => ({ ...prev, currentRole: null }));
    }
  }, [session, status]);

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
