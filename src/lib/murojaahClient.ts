import { db } from "@/lib/dexie";
import { IMutabaahDailyLocal } from "@/lib/dexie";

export async function submitMurojaahPartnerDataLocal(
  studentId: string,
  tanggal: string,
  data: any,
  guruId: string,
  tenantId: string
) {
  const mutabaahs = await db.mutabaahs.filter(m => {
    try {
      return m.studentId === studentId && new Date(m.tanggal).toISOString().split('T')[0] === tanggal;
    } catch {
      return false;
    }
  }).toArray();
  let mutabaah = mutabaahs[0];
  
  if (!mutabaah) {
    mutabaah = {
      _id: crypto.randomUUID(),
      studentId,
      guruId,
      tenantId,
      tanggal: new Date(tanggal),
      presensi: { dzikirPagiPetang: false, matanTuhfahJazari: false },
      ziyadah: { hasSetoran: false, talaqqiTakrir: false, binNadzorComplete: false },
      murojaahPartner: { isCompleted: true, ...data },
      tatsbit: { isCompleted: false },
      offlineSync: { isSynced: false, updatedAt: new Date() }
    };
    await db.mutabaahs.add(mutabaah);
    await db.syncQueue.add({
      action: 'CREATE',
      collection: 'MutabaahDaily',
      payload: mutabaah,
      createdAt: new Date()
    });
  } else {
    mutabaah.murojaahPartner = { isCompleted: true, ...data };
    mutabaah.offlineSync.isSynced = false;
    mutabaah.offlineSync.updatedAt = new Date();
    await db.mutabaahs.put(mutabaah);
    await db.syncQueue.add({
      action: 'UPDATE',
      collection: 'MutabaahDaily',
      payload: { _id: mutabaah._id, murojaahPartner: mutabaah.murojaahPartner },
      createdAt: new Date()
    });
  }
  return { success: true };
}

export async function submitTatsbitDataLocal(
  studentId: string,
  tanggal: string,
  data: any,
  guruId: string,
  tenantId: string
) {
  const mutabaahs = await db.mutabaahs.filter(m => {
    try {
      return m.studentId === studentId && new Date(m.tanggal).toISOString().split('T')[0] === tanggal;
    } catch {
      return false;
    }
  }).toArray();
  let mutabaah = mutabaahs[0];
  
  if (!mutabaah) {
    mutabaah = {
      _id: crypto.randomUUID(),
      studentId,
      guruId,
      tenantId,
      tanggal: new Date(tanggal),
      presensi: { dzikirPagiPetang: false, matanTuhfahJazari: false },
      ziyadah: { hasSetoran: false, talaqqiTakrir: false, binNadzorComplete: false },
      murojaahPartner: { isCompleted: false },
      tatsbit: { isCompleted: true, ...data },
      offlineSync: { isSynced: false, updatedAt: new Date() }
    };
    await db.mutabaahs.add(mutabaah);
    await db.syncQueue.add({
      action: 'CREATE',
      collection: 'MutabaahDaily',
      payload: mutabaah,
      createdAt: new Date()
    });
  } else {
    mutabaah.tatsbit = { isCompleted: true, ...data };
    mutabaah.offlineSync.isSynced = false;
    mutabaah.offlineSync.updatedAt = new Date();
    await db.mutabaahs.put(mutabaah);
    await db.syncQueue.add({
      action: 'UPDATE',
      collection: 'MutabaahDaily',
      payload: { _id: mutabaah._id, tatsbit: mutabaah.tatsbit },
      createdAt: new Date()
    });
  }
  return { success: true };
}

export async function resetMurojaahTatsbitDataLocal(
  studentId: string,
  tanggal: string
) {
  const mutabaahs = await db.mutabaahs.filter(m => {
    try {
      return m.studentId === studentId && new Date(m.tanggal).toISOString().split('T')[0] === tanggal;
    } catch {
      return false;
    }
  }).toArray();
  let mutabaah = mutabaahs[0];
  
  if (mutabaah) {
    mutabaah.murojaahPartner = { isCompleted: false };
    mutabaah.tatsbit = { isCompleted: false };
    mutabaah.offlineSync.isSynced = false;
    mutabaah.offlineSync.updatedAt = new Date();
    await db.mutabaahs.put(mutabaah);
    await db.syncQueue.add({
      action: 'UPDATE',
      collection: 'MutabaahDaily',
      payload: { _id: mutabaah._id, murojaahPartner: mutabaah.murojaahPartner, tatsbit: mutabaah.tatsbit },
      createdAt: new Date()
    });
  }
  return { success: true };
}
