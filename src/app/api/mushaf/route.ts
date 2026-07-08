import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  if (!page || isNaN(Number(page))) {
    return NextResponse.json(
      { error: "Page number is required and must be a number" },
      { status: 400 }
    );
  }

  try {
    // Gunakan Quran.com API v4
    // Mengambil ayat berdasarkan halaman, menyertakan detail kata (words) beserta teks uthmani dan nomor baris (line_number)
    const apiUrl = `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=text_uthmani,line_number,v1_page,v2_page,code_v1,code_v2`;
    
    const response = await fetch(apiUrl, {
      // Revalidate setiap 24 jam (86400 detik) karena isi Al-Quran tidak berubah
      next: { revalidate: 86400 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Quran API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching mushaf page:", error);
    return NextResponse.json(
      { error: "Failed to fetch mushaf data", details: error.message },
      { status: 500 }
    );
  }
}
