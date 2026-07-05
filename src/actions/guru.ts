"use server";

import dbConnect from "@/lib/db";
import { Halaqah } from "@/models/Halaqah";
import { Student } from "@/models/Student";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// Helper for generic session check
async function checkGuru() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const role = (session.user as any).role;
  // Memastikan yang akses minimal punya role guru, atau admin/super-admin jika sedang override/testing.
  if (role !== "guru" && role !== "admin-tenant" && role !== "super-admin") {
    throw new Error("Forbidden: Membutuhkan akses Guru");
  }
  return session;
}

export async function getMyHalaqahs() {
  try {
    const session = await checkGuru();
    await dbConnect();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    let query: any = {};
    if (role === "guru") {
      query.guruId = userId;
    } else if (role === "admin-tenant") {
      query.tenantId = tenantId;
    }

    const halaqahs = await Halaqah.find(query).lean();

    return {
      success: true,
      halaqahs: halaqahs.map((h: any) => ({
        _id: h._id.toString(),
        name: h.name,
        tenantId: h.tenantId.toString(),
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setStudentTartil(studentId: string, tartil: "Awal" | "Menengah" | "Akhir") {
  try {
    const session = await checkGuru();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const student = await Student.findOne({ _id: studentId, tenantId });
    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    student.tingkatanTartil = tartil;
    await student.save();

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getHalaqahDetailsForGuru(halaqahId: string) {
  try {
    const session = await checkGuru();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const halaqah = await Halaqah.findOne({ _id: halaqahId, tenantId }).lean();
    if (!halaqah) return { success: false, error: "Halaqah tidak ditemukan" };

    const students = await Student.find({ halaqahId, tenantId })
      .populate("partnerId", "nama")
      .sort({ nama: 1 })
      .lean();

    return {
      success: true,
      halaqah: {
        _id: halaqah._id.toString(),
        name: halaqah.name,
      },
      students: students.map((s: any) => ({
        _id: s._id.toString(),
        nama: s.nama,
        tingkatanTartil: s.tingkatanTartil,
        partnerId: s.partnerId ? s.partnerId._id.toString() : null,
        partnerName: s.partnerId ? s.partnerId.nama : null,
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setStudentPartnerGuru(studentId: string, partnerId: string | null) {
  try {
    const session = await checkGuru();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const student = await Student.findOne({ _id: studentId, tenantId });
    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    // Clear old reciprocal partner if exists
    if (student.partnerId && student.partnerId.toString() !== partnerId) {
      await Student.findOneAndUpdate(
        { _id: student.partnerId, tenantId },
        { partnerId: null }
      );
    }

    student.partnerId = partnerId ? new mongoose.Types.ObjectId(partnerId) : null;
    await student.save();

    // Set new reciprocal partner
    if (partnerId) {
      await Student.findOneAndUpdate(
        { _id: partnerId, tenantId },
        { partnerId: student._id }
      );
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
