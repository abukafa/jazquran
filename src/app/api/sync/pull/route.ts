import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { Halaqah } from "@/models/Halaqah";
import { Student } from "@/models/Student";
import { MutabaahDaily } from "@/models/MutabaahDaily";
import Quote from "@/models/Quote";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    // Base query for tenant-specific data
    const tenantQuery = tenantId ? { tenantId } : {};
    
    // In super-admin case, they might see everything, or nothing if no tenantId is set yet.
    // For now, if no tenantId, we'll just return their own user info and empty arrays for others.

    // 1. Fetch Users (for the current tenant)
    const users = tenantId ? await User.find(tenantQuery).lean() : [await User.findById(userId).lean()];

    // 2. Fetch Tenant(s)
    const tenants = tenantId ? await Tenant.find({ _id: tenantId }).lean() : [];
    // If super-admin without tenant, maybe they need all tenants?
    // Let's keep it simple: sync all tenants for super-admins.
    const allTenants = userRole === 'super-admin' ? await Tenant.find({}).lean() : tenants;

    // 3. Fetch Halaqahs
    const halaqahs = tenantId ? await Halaqah.find(tenantQuery).lean() : [];

    // 4. Fetch Students
    const students = tenantId ? await Student.find(tenantQuery).lean() : [];

    // 5. Fetch Mutabaahs (Limit to recent ones to save bandwidth, e.g., last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const mutabaahs = tenantId 
      ? await MutabaahDaily.find({ ...tenantQuery, tanggal: { $gte: thirtyDaysAgo } }).lean() 
      : [];

    // 6. Fetch Quotes
    const quotes = await Quote.find({}).lean(); // Quotes might be global or tenant specific? In existing schema, Quote doesn't have tenantId. So fetch all.

    // Map Mongo _id to string for Dexie
    const mapId = (docs: any[]) => docs.filter(Boolean).map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      ...(doc.tenantId ? { tenantId: doc.tenantId.toString() } : {}),
      ...(doc.guruId ? { guruId: doc.guruId.toString() } : {}),
      ...(doc.studentId ? { studentId: doc.studentId.toString() } : {}),
      ...(doc.halaqahId ? { halaqahId: doc.halaqahId.toString() } : {}),
      ...(doc.userId ? { userId: doc.userId.toString() } : {}),
      ...(doc.partnerId ? { partnerId: doc.partnerId.toString() } : {}),
      ...(doc.authorId ? { authorId: doc.authorId.toString() } : {}),
      ...(doc.likes ? { likes: doc.likes.map((id: any) => id.toString()) } : {}),
    }));

    return NextResponse.json({
      users: mapId(users),
      tenants: mapId(allTenants),
      halaqahs: mapId(halaqahs),
      students: mapId(students),
      mutabaahs: mapId(mutabaahs),
      quotes: mapId(quotes),
      session: {
        id: 'current_session',
        user: {
           _id: userId,
           name: session.user.name,
           email: session.user.email,
           role: userRole,
           tenantId: tenantId,
           avatar: session.user.image,
        },
        expires: session.expires,
        lastSync: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("SYNC_PULL_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
