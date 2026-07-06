"use server";
import { getStartOfDayUTC } from "@/lib/dateHelpers";
import connectDB from "@/lib/db";
import { MutabaahDaily } from "@/models/MutabaahDaily";
import { Student } from "@/models/Student";
import { Halaqah } from "@/models/Halaqah";
import { Tenant } from "@/models/Tenant";
import mongoose from "mongoose";

// Utility: Mendapatkan N hari ke belakang dengan aman (UTC Start of Day)
const getLastNDays = (n: number) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(getStartOfDayUTC(d));
  }
  return dates;
};

// Mengambil UTC Date untuk sinkronisasi dengan MongoDB aggregate $dayOfMonth
const formatDateObj = (d: Date) => {
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

export async function getMuridAnalytics(studentId: string) {
  try {
    await connectDB();
    const studentIdObj = new mongoose.Types.ObjectId(studentId);
    const stats = await MutabaahDaily.aggregate([
      { $match: { studentId: studentIdObj } },
      {
        $group: {
          _id: null,
          ziyadahCount: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaahCount: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbitCount: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } },
        }
      }
    ]);

    const sevenDays = getLastNDays(7);
    const dailyStats = await MutabaahDaily.aggregate([
      { $match: { studentId: studentIdObj, tanggal: { $gte: sevenDays[0] } } },
      {
        $group: {
          _id: { year: { $year: "$tanggal" }, month: { $month: "$tanggal" }, day: { $dayOfMonth: "$tanggal" } },
          ziyadah: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaah: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbit: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } }
        }
      }
    ]);

    const kelancaranGrades = await MutabaahDaily.aggregate([
      { $match: { studentId: studentIdObj, "ziyadah.nilaiKelancaran": { $exists: true, $ne: null } } },
      { $group: { _id: "$ziyadah.nilaiKelancaran", count: { $sum: 1 } } }
    ]);

    const labels = sevenDays.map(d => formatDateObj(d));
    const ziyadahData = labels.map(() => 0);
    const murojaahData = labels.map(() => 0);
    const tatsbitData = labels.map(() => 0);
    dailyStats.forEach((stat: any) => {
      const dateStr = `${stat._id.day.toString().padStart(2, "0")}/${stat._id.month.toString().padStart(2, "0")}`;
      const index = labels.indexOf(dateStr);
      if (index !== -1) { ziyadahData[index] = stat.ziyadah; murojaahData[index] = stat.murojaah; tatsbitData[index] = stat.tatsbit; }
    });

    let gradeA = 0, gradeB = 0, gradeC = 0;
    kelancaranGrades.forEach((g: any) => {
      if (!g._id) return;
      if (g._id.startsWith("A")) gradeA += g.count;
      else if (g._id.startsWith("B")) gradeB += g.count;
      else gradeC += g.count;
    });

    return {
      success: true,
      stats: { ziyadah: stats[0]?.ziyadahCount || 0, murojaah: stats[0]?.murojaahCount || 0, tatsbit: stats[0]?.tatsbitCount || 0 },
      dailyChart: { labels, datasets: [ { label: "Ziyadah", data: ziyadahData }, { label: "Partner", data: murojaahData }, { label: "Tatsbit", data: tatsbitData } ] },
      doughnutChart: { labels: ["A (Sangat Lancar)", "B (Lancar)", "C (Kurang)"], data: [gradeA, gradeB, gradeC] }
    };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function getGuruAnalytics(guruId: string) {
  try {
    await connectDB();
    const guruIdObj = new mongoose.Types.ObjectId(guruId);
    
    const stats = await MutabaahDaily.aggregate([
      { $match: { guruId: guruIdObj } },
      {
        $group: {
          _id: null,
          ziyadahCount: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaahCount: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbitCount: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } },
        }
      }
    ]);

    const sevenDays = getLastNDays(7);
    const dailyStats = await MutabaahDaily.aggregate([
      { $match: { guruId: guruIdObj, tanggal: { $gte: sevenDays[0] } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$tanggal" }, month: { $month: "$tanggal" } },
          ziyadah: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaah: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbit: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } }
        }
      }
    ]);

    const kelancaranGrades = await MutabaahDaily.aggregate([
      { $match: { guruId: guruIdObj, "ziyadah.nilaiKelancaran": { $exists: true, $ne: null } } },
      { $group: { _id: "$ziyadah.nilaiKelancaran", count: { $sum: 1 } } }
    ]);

    const labels = sevenDays.map(d => formatDateObj(d));
    const ziyadahData = labels.map(() => 0);
    const murojaahData = labels.map(() => 0);
    const tatsbitData = labels.map(() => 0);
    dailyStats.forEach((stat: any) => {
      const dateStr = `${stat._id.day.toString().padStart(2, "0")}/${stat._id.month.toString().padStart(2, "0")}`;
      const index = labels.indexOf(dateStr);
      if (index !== -1) { ziyadahData[index] = stat.ziyadah; murojaahData[index] = stat.murojaah; tatsbitData[index] = stat.tatsbit; }
    });

    let gradeA = 0, gradeB = 0, gradeC = 0;
    kelancaranGrades.forEach((g: any) => {
      if (!g._id) return;
      if (g._id.startsWith("A")) gradeA += g.count;
      else if (g._id.startsWith("B")) gradeB += g.count;
      else gradeC += g.count;
    });

    return {
      success: true,
      stats: { ziyadah: stats[0]?.ziyadahCount || 0, murojaah: stats[0]?.murojaahCount || 0, tatsbit: stats[0]?.tatsbitCount || 0 },
      dailyChart: { labels, datasets: [ { label: "Ziyadah Halaqah", data: ziyadahData }, { label: "Partner Halaqah", data: murojaahData }, { label: "Tatsbit Halaqah", data: tatsbitData } ] },
      doughnutChart: { labels: ["A (Sangat Lancar)", "B (Lancar)", "C (Kurang)"], data: [gradeA, gradeB, gradeC] }
    };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function getAdminAnalytics(tenantId: string) {
  try {
    await connectDB();
    const tenantIdObj = new mongoose.Types.ObjectId(tenantId);
    
    const stats = await MutabaahDaily.aggregate([
      { $match: { tenantId: tenantIdObj } },
      {
        $group: {
          _id: null,
          ziyadahCount: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaahCount: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbitCount: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } },
        }
      }
    ]);

    const sevenDays = getLastNDays(7);
    const dailyStats = await MutabaahDaily.aggregate([
      { $match: { tenantId: tenantIdObj, tanggal: { $gte: sevenDays[0] } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$tanggal" }, month: { $month: "$tanggal" } },
          ziyadah: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaah: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbit: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } }
        }
      }
    ]);

    const kelancaranGrades = await MutabaahDaily.aggregate([
      { $match: { tenantId: tenantIdObj, "ziyadah.nilaiKelancaran": { $exists: true, $ne: null } } },
      { $group: { _id: "$ziyadah.nilaiKelancaran", count: { $sum: 1 } } }
    ]);

    const labels = sevenDays.map(d => formatDateObj(d));
    const ziyadahData = labels.map(() => 0);
    const murojaahData = labels.map(() => 0);
    const tatsbitData = labels.map(() => 0);
    dailyStats.forEach((stat: any) => {
      const dateStr = `${stat._id.day.toString().padStart(2, "0")}/${stat._id.month.toString().padStart(2, "0")}`;
      const index = labels.indexOf(dateStr);
      if (index !== -1) { ziyadahData[index] = stat.ziyadah; murojaahData[index] = stat.murojaah; tatsbitData[index] = stat.tatsbit; }
    });

    let gradeA = 0, gradeB = 0, gradeC = 0;
    kelancaranGrades.forEach((g: any) => {
      if (!g._id) return;
      if (g._id.startsWith("A")) gradeA += g.count;
      else if (g._id.startsWith("B")) gradeB += g.count;
      else gradeC += g.count;
    });

    return {
      success: true,
      stats: { ziyadah: stats[0]?.ziyadahCount || 0, murojaah: stats[0]?.murojaahCount || 0, tatsbit: stats[0]?.tatsbitCount || 0 },
      dailyChart: { labels, datasets: [ { label: "Total Ziyadah Cabang", data: ziyadahData }, { label: "Total Partner Cabang", data: murojaahData }, { label: "Total Tatsbit Cabang", data: tatsbitData } ] },
      doughnutChart: { labels: ["A (Sangat Lancar)", "B (Lancar)", "C (Kurang)"], data: [gradeA, gradeB, gradeC] }
    };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function getSuperAdminAnalytics() {
  try {
    await connectDB();
    
    const totalTenants = await Tenant.countDocuments();
    const totalHalaqahs = await Halaqah.countDocuments();
    const totalStudents = await Student.countDocuments();

    const topTenants = await Student.aggregate([
      { $group: { _id: "$tenantId", studentCount: { $sum: 1 } } },
      { $sort: { studentCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "tenants", localField: "_id", foreignField: "_id", as: "tenantInfo" } }
    ]);
    const tenantLabels = topTenants.map(t => t.tenantInfo[0]?.name || "Unknown");
    const tenantData = topTenants.map(t => t.studentCount);

    const sevenDays = getLastNDays(7);
    const dailyStats = await MutabaahDaily.aggregate([
      { $match: { tanggal: { $gte: sevenDays[0] } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$tanggal" }, month: { $month: "$tanggal" } },
          ziyadah: { $sum: { $cond: [{ $or: ["$ziyadah.hasSetoran", "$ziyadah.talaqqiTakrir", "$ziyadah.binNadzorComplete"] }, 1, 0] } },
          murojaah: { $sum: { $cond: ["$murojaahPartner.isCompleted", 1, 0] } },
          tatsbit: { $sum: { $cond: ["$tatsbit.isCompleted", 1, 0] } }
        }
      }
    ]);

    const labels = sevenDays.map(d => formatDateObj(d));
    const ziyadahData = labels.map(() => 0);
    const murojaahData = labels.map(() => 0);
    const tatsbitData = labels.map(() => 0);
    dailyStats.forEach((stat: any) => {
      const dateStr = `${stat._id.day.toString().padStart(2, "0")}/${stat._id.month.toString().padStart(2, "0")}`;
      const index = labels.indexOf(dateStr);
      if (index !== -1) { ziyadahData[index] = stat.ziyadah; murojaahData[index] = stat.murojaah; tatsbitData[index] = stat.tatsbit; }
    });

    const kelancaranGrades = await MutabaahDaily.aggregate([
      { $match: { "ziyadah.nilaiKelancaran": { $exists: true, $ne: null } } },
      { $group: { _id: "$ziyadah.nilaiKelancaran", count: { $sum: 1 } } }
    ]);
    let gradeA = 0, gradeB = 0, gradeC = 0;
    kelancaranGrades.forEach((g: any) => {
      if (!g._id) return;
      if (g._id.startsWith("A")) gradeA += g.count;
      else if (g._id.startsWith("B")) gradeB += g.count;
      else gradeC += g.count;
    });

    return {
      success: true,
      stats: { tenants: totalTenants, halaqahs: totalHalaqahs, students: totalStudents },
      barChart: { labels: tenantLabels, data: tenantData },
      dailyChart: { labels, datasets: [ { label: "Global Ziyadah", data: ziyadahData }, { label: "Global Partner", data: murojaahData }, { label: "Global Tatsbit", data: tatsbitData } ] },
      doughnutChart: { labels: ["A (Sangat Lancar)", "B (Lancar)", "C (Kurang)"], data: [gradeA, gradeB, gradeC] }
    };
  } catch (error: any) { return { success: false, error: error.message }; }
}
