import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import { MutabaahDaily } from "@/models/MutabaahDaily";
import Quote from "@/models/Quote";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const results = [];

    for (const item of items) {
      const { action, collection, payload } = item;
      
      try {
        if (collection === 'MutabaahDaily') {
          if (action === 'CREATE') {
            const { _id, ...rest } = payload;
            await MutabaahDaily.create(rest);
          } else if (action === 'UPDATE') {
            await MutabaahDaily.findOneAndUpdate(
              { studentId: payload.studentId, tanggal: new Date(payload.tanggal) },
              { $set: payload },
              { upsert: true }
            );
          }
        } else if (collection === 'Quote') {
          if (action === 'CREATE') {
            const { _id, ...rest } = payload;
            await Quote.create(rest);
          } else if (action === 'UPDATE') {
            // Check if it's a real mongo id (24 chars hex) or uuid
            if (payload._id && payload._id.length === 24) {
              await Quote.findByIdAndUpdate(payload._id, { $set: payload });
            } else {
               // Handle uuid offline quotes update (e.g. likes).
               // If it's offline generated ID, it might not be in MongoDB yet unless previously synced.
               // We'll skip complex resolution for now, but log it.
               console.log("Updating offline quote", payload);
            }
          }
        }
        
        results.push({ id: item.id, status: 'success' });
      } catch (err: any) {
        console.error(`Sync error on item ${item.id}:`, err);
        results.push({ id: item.id, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("SYNC_PUSH_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
