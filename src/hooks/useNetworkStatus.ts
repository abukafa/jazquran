"use client";
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getSyncQueue, removeSyncRecords } from '@/lib/localdb';

import { submitZiyadahData } from '@/actions/ziyadah';
import { submitMurojaahPartnerData, submitTatsbitData } from '@/actions/murojaah';

// Fungsi untuk mengirim data sinkronisasi ke server
async function syncDataToServer(records: any[]) {
  console.log("Synchronizing with server...", records);
  
  let successfulIds: number[] = [];
  for (const record of records) {
    let success = false;
    try {
      if (record.collectionName === 'MutabaahDaily') {
        const res = await submitZiyadahData(record.data.studentId, record.data.data);
        if (res.success) success = true;
        else console.error("Gagal sinkronisasi record:", record, res.error);
      } else if (record.collectionName === 'MutabaahDaily_MurojaahPartner') {
        const { studentId, dateStr, murojaahData, originalDateStr } = record.data;
        const res = await submitMurojaahPartnerData(studentId, dateStr, murojaahData, originalDateStr);
        if (res.success) success = true;
        else console.error("Gagal sinkronisasi Murojaah:", record, (res as any).error);
      } else if (record.collectionName === 'MutabaahDaily_Tatsbit') {
        const { studentId, dateStr, tatsbitData, originalDateStr } = record.data;
        const res = await submitTatsbitData(studentId, dateStr, tatsbitData, originalDateStr);
        if (res.success) success = true;
        else console.error("Gagal sinkronisasi Tatsbit:", record, (res as any).error);
      }
    } catch (e) {
      console.error("Error selama sinkronisasi record:", e);
    }
    
    if (success && record.id !== undefined) {
      successfulIds.push(record.id);
    }
  }
  
  return successfulIds;
}

export function useNetworkStatus() {
  const { state, setOnline } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Setup initial state from browser
      const currentStatus = navigator.onLine;
      setOnline(currentStatus);

      const handleOnline = () => setOnline(true);
      const handleOffline = () => setOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Memantau state.isOnline: Jika online, otomatis eksekusi queue
  useEffect(() => {
    if (state.isOnline && !isSyncingRef.current) {
      processSyncQueue();
    }
  }, [state.isOnline]);

  const processSyncQueue = async () => {
    if (isSyncingRef.current) return;
    
    try {
      setIsSyncing(true);
      isSyncingRef.current = true;
      const queue = await getSyncQueue();
      
      if (queue.length > 0) {
        console.log(`Ditemukan ${queue.length} antrean sinkronisasi, memproses...`);
        const successfulIds = await syncDataToServer(queue);
        
        if (successfulIds.length > 0) {
          // Hapus record yang berhasil disinkronisasi
          await removeSyncRecords(successfulIds);
          console.log(`Berhasil menyinkronkan dan menghapus ${successfulIds.length} data antrean!`);
        }
      }
    } catch (error) {
      console.error("Kesalahan saat memproses antrean sinkronisasi:", error);
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  };

  return { isOnline: state.isOnline, isSyncing, processSyncQueue };
}
