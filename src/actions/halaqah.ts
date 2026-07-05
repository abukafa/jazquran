"use server";

import dbConnect from "@/lib/db";
import { Halaqah } from "@/models/Halaqah";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdminTenant() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin-tenant") {
    throw new Error("Unauthorized. Only admin-tenant can perform this action.");
  }
  return session;
}

export async function getHalaqahs() {
  try {
    const session = await checkAdminTenant();
    await dbConnect();

    const tenantId = (session.user as any).tenantId;
    
    // Fetch all halaqahs for this tenant and populate the guru
    const halaqahs = await Halaqah.find({ tenantId })
      .populate("guruId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch student counts for each halaqah
    const halaqahIds = halaqahs.map(h => h._id);
    const studentCounts = await Student.aggregate([
      { $match: { halaqahId: { $in: halaqahIds } } },
      { $group: { _id: "$halaqahId", count: { $sum: 1 } } }
    ]);

    const countMap = new Map(studentCounts.map(item => [item._id.toString(), item.count]));

    const result = halaqahs.map((h: any) => ({
      _id: h._id.toString(),
      name: h.name,
      guruId: h.guruId._id.toString(),
      guruName: h.guruId.name,
      studentCount: countMap.get(h._id.toString()) || 0,
      createdAt: h.createdAt
    }));

    return { success: true, halaqahs: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getGurus() {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const gurus = await User.find({ tenantId, role: "guru" })
      .select("name email")
      .sort({ name: 1 })
      .lean();

    return { 
      success: true, 
      gurus: gurus.map((g: any) => ({ _id: g._id.toString(), name: g.name, email: g.email })) 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createHalaqah(formData: FormData) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();

    const tenantId = (session.user as any).tenantId;
    const name = formData.get("name") as string;
    const guruId = formData.get("guruId") as string;

    if (!name || !guruId) {
      return { success: false, error: "Nama Halaqah dan Guru wajib diisi" };
    }

    const halaqah = await Halaqah.create({
      tenantId,
      name,
      guruId
    });

    return { success: true, halaqahId: halaqah._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateHalaqah(formData: FormData) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const guruId = formData.get("guruId") as string;
    const tenantId = (session.user as any).tenantId;

    if (!id || !name || !guruId) {
      return { success: false, error: "Data tidak lengkap" };
    }

    const halaqah = await Halaqah.findOneAndUpdate(
      { _id: id, tenantId }, // pastikan tenantId cocok demi keamanan
      { name, guruId },
      { new: true }
    );

    if (!halaqah) return { success: false, error: "Halaqah tidak ditemukan" };

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteHalaqah(id: string) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    // Remove halaqahId from all students first
    await Student.updateMany({ halaqahId: id, tenantId }, { $unset: { halaqahId: "" } });

    const deleted = await Halaqah.findOneAndDelete({ _id: id, tenantId });
    if (!deleted) return { success: false, error: "Halaqah tidak ditemukan" };

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentsByHalaqah(halaqahId: string) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const students = await Student.find({ halaqahId, tenantId })
      .populate("partnerId", "nama")
      .sort({ nama: 1 })
      .lean();

    return {
      success: true,
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

export async function getAvailableMurids() {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const muridUsers = await User.find({ tenantId, role: "murid" }).lean();
    const existingStudents = await Student.find({ tenantId }).lean();
    
    const studentsWithHalaqah = existingStudents.filter(s => s.halaqahId);
    const userIdsWithHalaqah = studentsWithHalaqah.map(s => s.userId?.toString()).filter(Boolean);
    
    const availableUsers = muridUsers.filter((u: any) => !userIdsWithHalaqah.includes(u._id.toString()));

    return {
      success: true,
      users: availableUsers.map((u: any) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addStudentToHalaqah(formData: FormData) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const halaqahId = formData.get("halaqahId") as string;
    const userId = formData.get("userId") as string;
    const tingkatanTartil = formData.get("tingkatanTartil") as string;

    if (!halaqahId || !userId) {
      return { success: false, error: "Halaqah dan Murid wajib diisi" };
    }

    const user = await User.findOne({ _id: userId, tenantId });
    if (!user) return { success: false, error: "Murid tidak ditemukan" };

    let student = await Student.findOne({ userId, tenantId });
    if (student) {
      student.halaqahId = halaqahId;
      student.tingkatanTartil = tingkatanTartil || "Awal";
      await student.save();
    } else {
      student = await Student.create({
        tenantId,
        userId,
        halaqahId,
        nama: user.name,
        tingkatanTartil: tingkatanTartil || "Awal"
      });
    }

    return { success: true, studentId: student._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeStudentFromHalaqah(studentId: string) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    const student = await Student.findOneAndUpdate(
      { _id: studentId, tenantId },
      { $unset: { halaqahId: 1, partnerId: 1 } },
      { new: true }
    );
    
    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    // Also remove this student from anyone who has them as a partner
    await Student.updateMany(
      { partnerId: studentId, tenantId },
      { $unset: { partnerId: 1 } }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setStudentPartner(studentId: string, partnerId: string) {
  try {
    const session = await checkAdminTenant();
    await dbConnect();
    const tenantId = (session.user as any).tenantId;

    // Update the student
    const student = await Student.findOneAndUpdate(
      { _id: studentId, tenantId },
      { partnerId: partnerId === "none" ? null : partnerId },
      { new: true }
    );

    if (!student) return { success: false, error: "Murid tidak ditemukan" };

    // Optionally set reciprocal partnership
    if (partnerId !== "none") {
       await Student.findOneAndUpdate(
         { _id: partnerId, tenantId },
         { partnerId: studentId }
       );
    } else {
       // If we removed the partner, we should also clear the reciprocal if it was set
       await Student.updateMany(
         { partnerId: studentId, tenantId },
         { $unset: { partnerId: 1 } }
       );
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
