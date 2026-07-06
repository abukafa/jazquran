"use server";
import dbConnect from "@/lib/db";
import { MutabaahDaily } from "@/models/MutabaahDaily";
import { Student } from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// Mengambil data Ziyadah murid untuk halaqah tertentu pada tanggal tertentu
export async function getZiyadahByDate(halaqahId: string | undefined, dateStr: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const role = session?.user ? (session.user as any).role : null;
    const userId = session?.user ? (session.user as any).id : null;
    
    if (!session || !role || (role !== "guru" && role !== "admin-tenant" && role !== "super-admin")) {
      return { success: false, error: "Akses ditolak" };
    }

    let studentQuery: any = { isActive: true };

    if (role === "guru") {
      // Guru melihat semua murid di halaqah yang dipilih, atau semua halaqahnya jika tidak memilih
      if (halaqahId) {
        studentQuery.halaqahId = new mongoose.Types.ObjectId(halaqahId);
      } else {
        const halaqahs = await mongoose.models.Halaqah.find({ guruId: userId }).select('_id').lean();
        studentQuery.halaqahId = { $in: halaqahs.map((h: any) => h._id) };
      }
    } else {
      // Admin / Super Admin wajib mengirimkan halaqahId untuk memfilter tabel
      if (!halaqahId) return { success: true, data: [] };
      studentQuery.halaqahId = new mongoose.Types.ObjectId(halaqahId);
      
      // Admin tenant hanya bisa melihat murid di tenantnya
      if (role === "admin-tenant") {
        studentQuery.tenantId = new mongoose.Types.ObjectId((session.user as any).tenantId);
      }
    }

    // 1. Dapatkan semua murid yang sesuai kriteria dan urutkan berdasarkan nama
    const students = await Student.find(studentQuery).sort({ nama: 1 }).lean();

    if (!students || students.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Dapatkan record mutabaah tanggal tersebut untuk murid-murid tersebut
    const queryDate = new Date(dateStr);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const studentIds = students.map((s) => s._id);

    const mutabaahLogs = await MutabaahDaily.find({
      studentId: { $in: studentIds },
      tanggal: { $gte: queryDate, $lt: nextDay },
    }).lean();

    // 3. Gabungkan data
    const combinedData = students.map((student: any) => {
      const log: any = mutabaahLogs.find(
        (m: any) => m.studentId.toString() === student._id.toString()
      );

      return {
        studentId: student._id.toString(),
        studentName: student.nama,
        hasSetoran: log?.ziyadah?.hasSetoran || false,
        juz: log?.ziyadah?.juz || null,
        halamanDari: log?.ziyadah?.halamanDari || null,
        halamanKe: log?.ziyadah?.halamanKe || null,
        nilaiKelancaran: log?.ziyadah?.nilaiKelancaran || null,
        talaqqiTakrir: log?.ziyadah?.talaqqiTakrir || false,
        talaqqiCount: log?.ziyadah?.talaqqiCount || 0,
        binNadzorComplete: log?.ziyadah?.binNadzorComplete || false,
        binNadzorJuz: log?.ziyadah?.binNadzorJuz || null,
        binNadzorHalamanDari: log?.ziyadah?.binNadzorHalamanDari || null,
        binNadzorHalamanKe: log?.ziyadah?.binNadzorHalamanKe || null,
        murojaahPartnerComplete: log?.murojaahPartner?.isCompleted || false,
      };
    });

    return { success: true, data: combinedData };
  } catch (error: any) {
    console.error("Error getZiyadahByDate:", error);
    return { success: false, error: error.message };
  }
}

// Menyimpan atau mengupdate setoran Ziyadah murid
export async function submitZiyadahData(studentId: string, data: any) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any) || !["guru", "admin-tenant"].includes((session.user as any).role)) {
      return { success: false, error: "Akses ditolak" };
    }

    const queryDate = new Date(data.originalDateStr || data.tanggal);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Cari apakah mutabaah tanggal tersebut sudah ada
    let mutabaah = await MutabaahDaily.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      tanggal: { $gte: queryDate, $lt: nextDay },
    });

    const student = await Student.findById(studentId);
    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    if (!mutabaah) {
      const newTargetDate = new Date(data.tanggal);
      newTargetDate.setHours(0, 0, 0, 0);
      // Buat baru jika belum ada
      mutabaah = new MutabaahDaily({
        tenantId: student.tenantId,
        studentId: student._id,
        guruId: new mongoose.Types.ObjectId((session.user as any).id),
        tanggal: newTargetDate,
        presensi: { dzikirPagiPetang: false, matanTuhfahJazari: false },
        ziyadah: { hasSetoran: false, talaqqiTakrir: false, binNadzorComplete: false },
        murojaahPartner: { isCompleted: false },
        tatsbit: { isCompleted: false }
      });
    } else if (data.originalDateStr && data.originalDateStr !== data.tanggal) {
      // Jika user mengubah tanggal di modal edit
      const newTargetDate = new Date(data.tanggal);
      newTargetDate.setHours(0, 0, 0, 0);
      mutabaah.tanggal = newTargetDate;
    }

    // Update field ziyadah berdasarkan input
    if (data.isReset) {
      if (data.type === 'setoran') {
        mutabaah.ziyadah.hasSetoran = false;
        mutabaah.ziyadah.juz = null;
        mutabaah.ziyadah.halamanDari = null;
        mutabaah.ziyadah.halamanKe = null;
        mutabaah.ziyadah.nilaiKelancaran = null;
      } else if (data.type === 'talaqqi') {
        mutabaah.ziyadah.talaqqiTakrir = false;
        mutabaah.ziyadah.talaqqiCount = 0;
      } else if (data.type === 'binnadzor') {
        mutabaah.ziyadah.binNadzorComplete = false;
        mutabaah.ziyadah.binNadzorJuz = null;
        mutabaah.ziyadah.binNadzorHalamanDari = null;
        mutabaah.ziyadah.binNadzorHalamanKe = null;
      }
    } else {
      if (data.type === 'setoran') {
        mutabaah.ziyadah.hasSetoran = true;
        mutabaah.ziyadah.juz = data.juz;
        mutabaah.ziyadah.halamanDari = data.halamanDari;
        mutabaah.ziyadah.halamanKe = data.halamanKe;
        mutabaah.ziyadah.nilaiKelancaran = data.nilaiKelancaran;
      } else if (data.type === 'talaqqi') {
        mutabaah.ziyadah.talaqqiTakrir = (data.talaqqiCount >= 20);
        mutabaah.ziyadah.talaqqiCount = data.talaqqiCount;
      } else if (data.type === 'binnadzor') {
        mutabaah.ziyadah.binNadzorComplete = true;
        mutabaah.ziyadah.binNadzorJuz = data.juz;
        mutabaah.ziyadah.binNadzorHalamanDari = data.halamanDari;
        mutabaah.ziyadah.binNadzorHalamanKe = data.halamanKe;
      }
    }

    await mutabaah.save();
    return { success: true };
  } catch (error: any) {
    console.error("Error submitZiyadahData:", error);
    return { success: false, error: error.message };
  }
}

// Mengambil histori Ziyadah untuk murid yang sedang login (role: murid)
export async function getStudentZiyadahHistory(dateStr?: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any) || (session.user as any).role !== "murid") {
      return { success: false, error: "Akses ditolak" };
    }

    const userId = (session.user as any).id;
    
    const student = await Student.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
    if (!student) return { success: false, error: "Profil santri tidak ditemukan" };

    // Filter query
    let query: any = { studentId: student._id };
    
    if (dateStr) {
      const queryDate = new Date(dateStr);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.tanggal = { $gte: queryDate, $lt: nextDay };
    }

    const mutabaahLogs = await MutabaahDaily.find(query)
      .sort({ tanggal: -1 })
      .limit(30) // Ambil 30 hari terakhir jika tidak ada filter spesifik
      .lean();

    const formattedData = mutabaahLogs.map((log: any) => ({
      _id: log._id.toString(),
      tanggal: log.tanggal,
      hasSetoran: log.ziyadah?.hasSetoran || false,
      juz: log.ziyadah?.juz || null,
      halamanDari: log.ziyadah?.halamanDari || null,
      halamanKe: log.ziyadah?.halamanKe || null,
      nilaiKelancaran: log.ziyadah?.nilaiKelancaran || null,
      talaqqiTakrir: log.ziyadah?.talaqqiTakrir || false,
      talaqqiCount: log.ziyadah?.talaqqiCount || 0,
      binNadzorComplete: log.ziyadah?.binNadzorComplete || false,
      binNadzorJuz: log.ziyadah?.binNadzorJuz || null,
      binNadzorHalamanDari: log.ziyadah?.binNadzorHalamanDari || null,
      binNadzorHalamanKe: log.ziyadah?.binNadzorHalamanKe || null,
      murojaahPartnerComplete: log.murojaahPartner?.isCompleted || false,
    }));

    // Hitung berapa Juz unik yang pernah disetorkan oleh santri ini sepanjang waktu
    const distinctJuz = await mongoose.models.MutabaahDaily.distinct("ziyadah.juz", {
      studentId: student._id,
      "ziyadah.hasSetoran": true,
      "ziyadah.juz": { $ne: null }
    });

    return { 
      success: true, 
      data: formattedData,
      distinctJuzCount: distinctJuz.length 
    };
  } catch (error: any) {
    console.error("Error getStudentZiyadahHistory:", error);
    return { success: false, error: error.message };
  }
}
