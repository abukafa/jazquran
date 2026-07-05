"use client";

import React, { useState, useEffect } from "react";
import { getUsers, getTenants, updateUserRole } from "@/actions/admin";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, tenantsRes] = await Promise.all([
      getUsers(searchQuery),
      getTenants()
    ]);
    if (usersRes.users) setUsers(usersRes.users);
    if (tenantsRes.tenants) setTenants(tenantsRes.tenants);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleRoleChange = async (userId: string, newRole: string, currentTenantId: string | undefined) => {
    setIsUpdating(userId);
    const res = await updateUserRole(userId, newRole, currentTenantId || "none");
    if (res?.error) {
      alert(res.error);
    }
    await fetchData();
    setIsUpdating(null);
  };

  const handleTenantChange = async (userId: string, currentRole: string, newTenantId: string) => {
    setIsUpdating(userId);
    const res = await updateUserRole(userId, currentRole, newTenantId);
    if (res?.error) {
      alert(res.error);
    }
    await fetchData();
    setIsUpdating(null);
  };

  const isSuperAdmin = (session?.user as any)?.role === "super-admin";

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-sage-600 transition">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Kelola Pengguna</h1>
          <p className="text-xs text-slate-500">Manajemen Hak Akses</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Cari email atau nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sage-500"
            />
          </div>
          <button type="submit" className="bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold">Cari</button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 pl-2">Hasil Pencarian ({users.length})</h2>
        {loading ? (
          <div className="text-center py-10 text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100">Pencarian tidak menemukan hasil.</div>
        ) : (
          users.map(user => (
            <div key={user._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 relative">
              {isUpdating === user._id && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                  <i className="fa-solid fa-circle-notch fa-spin text-sage-600 text-2xl"></i>
                </div>
              )}
              <div className="flex items-center gap-3">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-12 h-12 rounded-full border border-slate-200" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value, user.tenantId?._id)}
                    disabled={!isSuperAdmin && user.role === "super-admin"}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-2 font-semibold"
                  >
                    {isSuperAdmin && <option value="super-admin">Super Admin</option>}
                    <option value="admin-tenant">Admin Cabang</option>
                    <option value="guru">Guru / Ustadz</option>
                    <option value="murid">Murid / Santri</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cabang</label>
                  <select 
                    value={user.tenantId?._id || "none"}
                    onChange={(e) => handleTenantChange(user._id, user.role, e.target.value)}
                    disabled={!isSuperAdmin}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-2 font-semibold"
                  >
                    <option value="none">-- Belum Tertaut --</option>
                    {tenants.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
