import { db } from "@/lib/dexie";


export async function submitZiyadahDataLocal(
  studentId: string,
  payload: any,
  guruId: string,
  tenantId: string
) {
  try {
    const { type, isReset, tanggal, originalDateStr, ...data } = payload;
    const targetDate = isReset ? originalDateStr : tanggal;
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);

    // Get existing mutabaah for this student on this date
    const existingRecords = await db.mutabaahs
      .where("studentId")
      .equals(studentId)
      .toArray();
    
    let existing = existingRecords.find(
      (r) => {
        try {
          return new Date(r.tanggal).toISOString().split("T")[0] === startOfDay.toISOString().split("T")[0];
        } catch {
          return false;
        }
      }
    );

    if (!existing) {
      existing = {
        _id: crypto.randomUUID(),
        tenantId,
        guruId,
        studentId,
        tanggal: startOfDay,
        presensi: { dzikirPagiPetang: false, matanTuhfahJazari: false },
        ziyadah: {
          hasSetoran: false,
          talaqqiTakrir: false,
          binNadzorComplete: false,
        },
        murojaahPartner: { isCompleted: false },
        tatsbit: { isCompleted: false },
        offlineSync: { isSynced: false, updatedAt: new Date() },
      };
    }

    if (!existing.ziyadah) {
      existing.ziyadah = {
        hasSetoran: false,
        talaqqiTakrir: false,
        binNadzorComplete: false,
      };
    }

    if (isReset) {
      if (type === "setoran") {
        existing.ziyadah.hasSetoran = false;
        existing.ziyadah.juz = undefined;
        existing.ziyadah.halamanDari = undefined;
        existing.ziyadah.halamanKe = undefined;
        existing.ziyadah.nilaiKelancaran = undefined;
      } else if (type === "talaqqi") {
        existing.ziyadah.talaqqiTakrir = false;
        existing.ziyadah.talaqqiCount = 0;
      } else if (type === "binnadzor") {
        existing.ziyadah.binNadzorComplete = false;
        existing.ziyadah.binNadzorJuz = undefined;
        existing.ziyadah.binNadzorHalamanDari = undefined;
        existing.ziyadah.binNadzorHalamanKe = undefined;
      }
    } else {
      if (type === "setoran") {
        existing.ziyadah.hasSetoran = true;
        existing.ziyadah.juz = data.juz;
        existing.ziyadah.halamanDari = data.halamanDari;
        existing.ziyadah.halamanKe = data.halamanKe;
        existing.ziyadah.nilaiKelancaran = data.nilaiKelancaran;
      } else if (type === "talaqqi") {
        existing.ziyadah.talaqqiCount = data.talaqqiCount;
        existing.ziyadah.talaqqiTakrir = data.talaqqiCount >= 20;
      } else if (type === "binnadzor") {
        existing.ziyadah.binNadzorComplete = true;
        existing.ziyadah.binNadzorJuz = data.juz;
        existing.ziyadah.binNadzorHalamanDari = data.halamanDari;
        existing.ziyadah.binNadzorHalamanKe = data.halamanKe;
      }
    }

    existing.offlineSync = { isSynced: false, updatedAt: new Date() };

    await db.mutabaahs.put(existing);

    // Queue for sync
    await db.syncQueue.add({
      action: "UPDATE",
      collection: "MutabaahDaily",
      payload: existing,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Local submit Ziyadah error:", error);
    return { success: false, error: error.message };
  }
}
