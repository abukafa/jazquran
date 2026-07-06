"use server";

import { getStartOfDayUTC } from '@/lib/dateHelpers';
import dbConnect from "@/lib/db";
import { MutabaahDaily } from "@/models/MutabaahDaily";
import { Student } from "@/models/Student";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// Mengambil data Murojaah & Tatsbit (mirip getZiyadahByDate)
export async function getMurojaahByDate(halaqahId: string | undefined, dateStr: string) {
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
      if (halaqahId) {
        studentQuery.halaqahId = new mongoose.Types.ObjectId(halaqahId);
      } else {
        const halaqahs = await mongoose.models.Halaqah.find({ guruId: userId }).select('_id').lean();
        studentQuery.halaqahId = { $in: halaqahs.map((h: any) => h._id) };
      }
    } else {
      if (!halaqahId) return { success: true, data: [] };
      studentQuery.halaqahId = new mongoose.Types.ObjectId(halaqahId);
      
      if (role === "admin-tenant") {
        studentQuery.tenantId = new mongoose.Types.ObjectId((session.user as any).tenantId);
      }
    }

    const students = await Student.find(studentQuery).populate("partnerId", "nama").sort({ nama: 1 }).lean();

    if (!students || students.length === 0) {
      return { success: true, data: [] };
    }

    const queryDate = new Date(dateStr);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const studentIds = students.map((s) => s._id);
    const mutabaahLogs = await MutabaahDaily.find({
      studentId: { $in: studentIds },
      tanggal: { $gte: queryDate, $lt: nextDay },
    }).lean();

    const mutabaahMap = new Map();
    mutabaahLogs.forEach((log) => {
      mutabaahMap.set(log.studentId.toString(), log);
    });

    const data = students.map((student: any) => {
      const log = mutabaahMap.get(student._id.toString());
      return {
        _id: student._id.toString(),
        studentName: student.nama,
        partnerName: student.partnerId ? student.partnerId.nama : "-",
        // Murojaah Partner
        murojaahPartnerComplete: log?.murojaahPartner?.isCompleted || false,
        murojaahPartnerJuz: log?.murojaahPartner?.juz || null,
        murojaahPartnerDari: log?.murojaahPartner?.halamanDari || null,
        murojaahPartnerKe: log?.murojaahPartner?.halamanKe || null,
        // Tatsbit
        tatsbitComplete: log?.tatsbit?.isCompleted || false,
        tatsbitJuz: log?.tatsbit?.juz || null,
        tatsbitDari: log?.tatsbit?.halamanDari || null,
        tatsbitKe: log?.tatsbit?.halamanKe || null,
        tatsbitNilai: log?.tatsbit?.nilai || null,
      };
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error getMurojaahByDate:", error);
    return { success: false, error: error.message };
  }
}

export async function submitMurojaahPartnerData(
  studentId: string,
  dateStr: string,
  murojaahData: {
    juz: number;
    halamanDari: string;
    halamanKe: string;
  },
  originalDateStr?: string
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const student = await Student.findById(studentId).populate("halaqahId");
    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    // Validasi Izin Akses (Mekanisme Penguncian / Hak Akses)
    if (role === "murid") {
      // Pastikan yang submit adalah user murid
      const currentUserStudent = await Student.findOne({ userId });
      if (!currentUserStudent) {
        return { success: false, error: "Profil murid Anda tidak valid" };
      }
      
      // Pastikan murid ini adalah PARTNER dari studentId
      if (student.partnerId?.toString() !== currentUserStudent._id.toString()) {
        return { success: false, error: "Hanya partner hafalan yang berhak menginput data ini" };
      }
    } else if (!["guru", "admin-tenant"].includes(role)) {
      return { success: false, error: "Hanya Guru, Admin Tenant, dan Partner yang bisa menginput Murojaah" };
    }

    // 1. Dapatkan/Buat Mutabaah untuk tanggal Target (dateStr)
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const targetNextDay = new Date(targetDate);
    targetNextDay.setDate(targetNextDay.getDate() + 1);

    let targetMutabaah = await MutabaahDaily.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      tanggal: { $gte: targetDate, $lt: targetNextDay },
    });

    if (!targetMutabaah) {
      let actualGuruId = role === "guru" ? userId : undefined;
      if (student.halaqahId && (student.halaqahId as any).guruId) {
        actualGuruId = (student.halaqahId as any).guruId;
      }
      
      targetMutabaah = new MutabaahDaily({
        tenantId: student.tenantId,
        studentId: student._id,
        guruId: actualGuruId || (student as any).halaqahId,
        tanggal: targetDate,
        presensi: { dzikirPagiPetang: false, matanTuhfahJazari: false },
        ziyadah: { hasSetoran: false, talaqqiTakrir: false, binNadzorComplete: false },
        murojaahPartner: { isCompleted: false },
        tatsbit: { isCompleted: false }
      });
    }

    // 2. Jika user mengubah tanggal di modal edit
    if (originalDateStr && originalDateStr !== dateStr) {
      const oldDate = new Date(originalDateStr);
      oldDate.setHours(0, 0, 0, 0);
      const oldNextDay = new Date(oldDate);
      oldNextDay.setDate(oldNextDay.getDate() + 1);

      let oldMutabaah = await MutabaahDaily.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        tanggal: { $gte: oldDate, $lt: oldNextDay },
      });

      if (oldMutabaah) {
        // Hapus data murojaahPartner dari tanggal yang lama karena sudah dipindah
        oldMutabaah.murojaahPartner = {
          isCompleted: false,
          juz: undefined,
          halamanDari: undefined,
          halamanKe: undefined,
        };
        await oldMutabaah.save();
      }
    }

    // 3. Update field murojaahPartner di targetMutabaah
    targetMutabaah.murojaahPartner = {
      isCompleted: true,
      juz: murojaahData.juz,
      halamanDari: murojaahData.halamanDari,
      halamanKe: murojaahData.halamanKe,
    };

    await targetMutabaah.save();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitTatsbitData(
  studentId: string,
  dateStr: string,
  tatsbitData: {
    juz: number;
    halamanDari: string;
    halamanKe: string;
    nilai: string;
  },
  originalDateStr?: string
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    const role = session?.user ? (session.user as any).role : null;
    if (!session || !["guru", "admin-tenant"].includes(role)) {
      return { success: false, error: "Hanya Guru dan Admin Tenant yang dapat mengisi Tatsbit" };
    }

    const userId = (session.user as any).id;
    const student = await Student.findById(studentId).populate("halaqahId");
    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    // 1. Dapatkan/Buat Mutabaah untuk tanggal Target (dateStr)
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const targetNextDay = new Date(targetDate);
    targetNextDay.setDate(targetNextDay.getDate() + 1);

    let targetMutabaah = await MutabaahDaily.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      tanggal: { $gte: targetDate, $lt: targetNextDay },
    });

    if (!targetMutabaah) {
      let actualGuruId = userId;
      if (student.halaqahId && (student.halaqahId as any).guruId) {
        actualGuruId = (student.halaqahId as any).guruId;
      }

      targetMutabaah = new MutabaahDaily({
        tenantId: student.tenantId,
        studentId: student._id,
        guruId: actualGuruId,
        tanggal: targetDate,
        presensi: { dzikirPagiPetang: false, matanTuhfahJazari: false },
        ziyadah: { hasSetoran: false, talaqqiTakrir: false, binNadzorComplete: false },
        murojaahPartner: { isCompleted: false },
        tatsbit: { isCompleted: false }
      });
    }

    // 2. Jika user mengubah tanggal di modal edit
    if (originalDateStr && originalDateStr !== dateStr) {
      const oldDate = new Date(originalDateStr);
      oldDate.setHours(0, 0, 0, 0);
      const oldNextDay = new Date(oldDate);
      oldNextDay.setDate(oldNextDay.getDate() + 1);

      let oldMutabaah = await MutabaahDaily.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        tanggal: { $gte: oldDate, $lt: oldNextDay },
      });

      if (oldMutabaah) {
        // Hapus data tatsbit dari tanggal yang lama karena sudah dipindah
        oldMutabaah.tatsbit = {
          isCompleted: false,
          juz: undefined,
          halamanDari: undefined,
          halamanKe: undefined,
          nilai: undefined,
        };
        await oldMutabaah.save();
      }
    }

    // 3. Update field tatsbit di targetMutabaah
    targetMutabaah.tatsbit = {
      isCompleted: true,
      juz: tatsbitData.juz,
      halamanDari: tatsbitData.halamanDari,
      halamanKe: tatsbitData.halamanKe,
      nilai: tatsbitData.nilai as any,
    };

    await targetMutabaah.save();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Untuk murid melihat daftar mutabaah partner dan history-nya
export async function getMuridMurojaahData(dateStr: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "murid") {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;
    const student = await Student.findOne({ userId }).populate("partnerId", "nama");
    if (!student) return { success: false, error: "Profil murid tidak ditemukan" };

    const queryDate = new Date(dateStr);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Partner Data
    let partnerData = null;
    if (student.partnerId) {
      const partnerLog = await MutabaahDaily.findOne({
        studentId: student.partnerId._id,
        tanggal: { $gte: queryDate, $lt: nextDay },
      }).lean();

      partnerData = {
        _id: student.partnerId._id.toString(),
        studentName: (student.partnerId as any).nama,
        murojaahPartnerComplete: partnerLog?.murojaahPartner?.isCompleted || false,
        murojaahPartnerJuz: partnerLog?.murojaahPartner?.juz || null,
        murojaahPartnerDari: partnerLog?.murojaahPartner?.halamanDari || null,
        murojaahPartnerKe: partnerLog?.murojaahPartner?.halamanKe || null,
      };
    }

    // My Own History (30 records)
    const myHistory = await MutabaahDaily.find({
      studentId: student._id
    })
    .sort({ tanggal: -1 })
    .limit(30)
    .lean();

    const formattedHistory = myHistory.map((log: any) => ({
      _id: log._id.toString(),
      tanggal: log.tanggal,
      murojaahPartnerComplete: log.murojaahPartner?.isCompleted || false,
      murojaahPartnerJuz: log.murojaahPartner?.juz || null,
      murojaahPartnerDari: log.murojaahPartner?.halamanDari || null,
      murojaahPartnerKe: log.murojaahPartner?.halamanKe || null,
      tatsbitComplete: log.tatsbit?.isCompleted || false,
      tatsbitJuz: log.tatsbit?.juz || null,
      tatsbitDari: log.tatsbit?.halamanDari || null,
      tatsbitKe: log.tatsbit?.halamanKe || null,
      tatsbitNilai: log.tatsbit?.nilai || null,
    }));

    return { 
      success: true, 
      myHistory: formattedHistory,
      partnerData
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetMurojaahTatsbitData(studentId: string, dateStr: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const role = session?.user ? (session.user as any).role : null;
    
    if (!session || !["guru", "admin-tenant"].includes(role)) {
      return { success: false, error: "Akses ditolak" };
    }

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const targetNextDay = new Date(targetDate);
    targetNextDay.setDate(targetNextDay.getDate() + 1);

    const mutabaah = await MutabaahDaily.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      tanggal: { $gte: targetDate, $lt: targetNextDay },
    });

    if (mutabaah) {
      mutabaah.murojaahPartner = { isCompleted: false };
      mutabaah.tatsbit = { isCompleted: false };
      await mutabaah.save();
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
