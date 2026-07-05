"use client";

import React, { useState, useEffect } from "react";
import { getTenants, createTenant } from "@/actions/admin";
import Link from "next/link";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTenantName, setNewTenantName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const res = await getTenants();
    if (res.tenants) {
      setTenants(res.tenants);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", newTenantName);
    
    const res = await createTenant(formData);
    if (res.success) {
      setNewTenantName("");
      fetchTenants();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Kelola Cabang</h1>
          <p className="text-xs text-slate-500">Super Admin Dashboard</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-700">Tambah Cabang Baru</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Nama Cabang / Institusi" 
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sage-500"
            required
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-sage-600 hover:bg-sage-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2"
          >
            {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-plus"></i>}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 pl-2">Daftar Cabang ({tenants.length})</h2>
        {loading ? (
          <div className="text-center py-10 text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100">Belum ada cabang.</div>
        ) : (
          tenants.map(tenant => (
            <div key={tenant._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{tenant.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg uppercase font-bold tracking-widest">{tenant.code}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{tenant.status === 'active' ? 'Aktif' : 'Suspended'}</span>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-sage-600 flex items-center justify-center transition border border-slate-100">
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
