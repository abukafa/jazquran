"use client";
import { useState, useEffect } from 'react';
import { getSyncQueue, removeSyncRecords } from '@/lib/localdb';

import { submitZiyadahData } from '@/actions/ziyadah';
import { submitMurojaahPartnerData, submitTatsbitData } from '@/actions/murojaah';

// Fungsi untuk mengirim data sinkronisasi ke server
async function syncDataToServer(records: any[]) {
  console.log("Synchronizing with server...", records);
  
  let allSuccess = true;
  for (const record of records) {
    if (record.collectionName === 'MutabaahDaily') {
      const res = await submitZiyadahData(record.data.studentId, record.data.data);
      if (!res.success) {
        console.error("Gagal sinkronisasi record:", record, res.error);
        allSuccess = false;
      }
    } else if (record.collectionName === 'MutabaahDaily_MurojaahPartner') {
      const { studentId, dateStr, murojaahData } = record.data;
      const res = await submitMurojaahPartnerData(studentId, dateStr, murojaahData);
      if (!res.success) {
        console.error("Gagal sinkronisasi Murojaah:", record, (res as any).error);
        allSuccess = false;
      }
    } else if (record.collectionName === 'MutabaahDaily_Tatsbit') {
      const { studentId, dateStr, tatsbitData } = record.data;
      const res = await submitTatsbitData(studentId, dateStr, tatsbitData);
      if (!res.success) {
        console.error("Gagal sinkronisasi Tatsbit:", record, (res as any).error);
        allSuccess = false;
      }
    }
  }
  
  return allSuccess;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Pastikan jalan di sisi klien
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = async () => {
        setIsOnline(true);
        // Ketika kembali online, proses antrean sinkronisasi
        await processSyncQueue();
      };
      
      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const processSyncQueue = async () => {
    try {
      setIsSyncing(true);
      const queue = await getSyncQueue();
      
      if (queue.length > 0) {
        console.log(`Ditemukan ${queue.length} antrean sinkronisasi, memproses...`);
        const success = await syncDataToServer(queue);
        
        if (success) {
          // Hapus record yang berhasil disinkronisasi
          const ids = queue.map(q => q.id).filter(id => id !== undefined) as number[];
          await removeSyncRecords(ids);
          console.log("Sinkronisasi berhasil diselesaikan!");
        }
      }
    } catch (error) {
      console.error("Kesalahan saat memproses antrean sinkronisasi:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isOnline, isSyncing, processSyncQueue };
}
