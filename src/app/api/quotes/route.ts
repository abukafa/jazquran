import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Quote from "@/models/Quote";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Pagination params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const quotes = await Quote.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorId", "name avatar")
      .lean();

    return NextResponse.json({ success: true, data: quotes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { text, verseRef, verseText, verseTranslation } = body;

    if (!text || !verseRef || !verseText || !verseTranslation) {
      return NextResponse.json(
        { success: false, message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    await dbConnect();

    const newQuote = await Quote.create({
      text,
      verseRef,
      verseText,
      verseTranslation,
      authorId: (session.user as any).id, // assuming session contains id
      likes: [],
    });

    // Populate the newly created quote so the frontend gets the author info immediately
    await newQuote.populate("authorId", "name avatar");

    return NextResponse.json({ success: true, data: newQuote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
