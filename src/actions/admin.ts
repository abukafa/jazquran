"use server";

import dbConnect from "@/lib/db";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

function generateCode(name: string) {
  const prefix = name
    .replace(/[^A-Za-z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomStr}`;
}

export async function createTenant(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "super-admin") {
      return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    if (!name) return { error: "Name is required" };

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let code = generateCode(name);

    await dbConnect();

    // Ensure unique code
    while (await Tenant.findOne({ code })) {
      code = generateCode(name);
    }

    const newTenant = await Tenant.create({ name, slug, code });
    revalidatePath("/dashboard/admin/tenants");
    return { success: true, tenant: JSON.parse(JSON.stringify(newTenant)) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTenants() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: "Unauthorized" };
    }
    await dbConnect();
    const tenants = await Tenant.find({}).sort({ createdAt: -1 });
    return { tenants: JSON.parse(JSON.stringify(tenants)) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getUsers(searchQuery?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const role = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (role !== "super-admin" && role !== "admin-tenant") {
      return { error: "Unauthorized" };
    }

    await dbConnect();

    const query: any = {};
    if (role === "admin-tenant") {
      if (!tenantId) return { error: "Tenant ID missing" };
      query.tenantId = tenantId;
    }

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .populate("tenantId")
      .sort({ createdAt: -1 })
      .limit(100);
    return { users: JSON.parse(JSON.stringify(users)) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateUserRole(
  userId: string,
  newRole: string,
  newTenantId?: string,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const callerRole = (session.user as any).role;
    const callerTenantId = (session.user as any).tenantId;

    if (callerRole !== "super-admin" && callerRole !== "admin-tenant") {
      return { error: "Unauthorized" };
    }

    await dbConnect();

    // Security checks for admin-tenant
    if (callerRole === "admin-tenant") {
      if (newRole === "super-admin") return { error: "Unauthorized" };
      if (newTenantId && newTenantId !== "none" && newTenantId !== callerTenantId) {
        return { error: "Unauthorized" };
      }
      
      const targetUser = await User.findById(userId);
      if (targetUser && targetUser.tenantId && targetUser.tenantId.toString() !== callerTenantId) {
        return { error: "Unauthorized" };
      }
    }

    const updateData: any = { role: newRole };
    if (newTenantId && newTenantId !== "none") {
      updateData.tenantId = new mongoose.Types.ObjectId(newTenantId);
    } else if (newTenantId === "none") {
      updateData.$unset = { tenantId: 1 };
    }

    if (updateData.$unset) {
      await User.findByIdAndUpdate(userId, {
        role: newRole,
        $unset: { tenantId: 1 },
      });
    } else {
      await User.findByIdAndUpdate(userId, updateData);
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function linkUserToTenant(tenantCode: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    await dbConnect();
    const tenant = await Tenant.findOne({ code: tenantCode.toUpperCase() });
    if (!tenant) {
      return { error: "Kode Cabang tidak ditemukan." };
    }

    const userId = (session.user as any).id;
    await User.findByIdAndUpdate(userId, { tenantId: tenant._id });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTenantSettings(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const role = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (role !== "admin-tenant" && role !== "super-admin") {
      return { error: "Unauthorized" };
    }
    if (!tenantId) {
      return { error: "No tenant associated" };
    }

    const period = formData.get("period") as string;
    const name = formData.get("name") as string;
    
    await dbConnect();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (period !== null && period !== undefined) updateData["setting.period"] = period;

    // Use raw MongoDB updateOne to completely bypass Mongoose document tracking issues
    // This forcefully sets the nested fields in MongoDB
    const result = await Tenant.updateOne(
      { _id: tenantId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return { error: "Tenant not found" };
    }

    revalidatePath("/dashboard/admin/tenant-settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTenantInfo() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return { error: "No tenant associated" };

    await dbConnect();
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return { error: "Tenant not found" };

    return {
      success: true,
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        code: tenant.code,
        status: tenant.status,
        period: tenant.setting?.period || "Semester Berjalan",
        createdAt: tenant.createdAt?.toISOString(),
      },
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
