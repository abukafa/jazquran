import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Quote from "@/models/Quote";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session" },
        { status: 400 }
      );
    }

    await dbConnect();

    const quote = await Quote.findById(id);
    if (!quote) {
      return NextResponse.json(
        { success: false, message: "Quote not found" },
        { status: 404 }
      );
    }

    // Toggle like
    const hasLiked = quote.likes.includes(userId);
    if (hasLiked) {
      // Remove like
      quote.likes.pull(userId);
    } else {
      // Add like
      quote.likes.push(userId);
    }

    await quote.save();

    return NextResponse.json({ 
      success: true, 
      hasLiked: !hasLiked, 
      likesCount: quote.likes.length 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
