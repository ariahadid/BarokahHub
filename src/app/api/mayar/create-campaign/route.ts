import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMayarCampaign } from "@/lib/mayar";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MAYAR_API_KEY) {
    return NextResponse.json({ error: "Mayar API belum dikonfigurasi" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, description, targetAmount } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama program wajib diisi" }, { status: 400 });
    }

    const result = await createMayarCampaign({ name, description, targetAmount });

    return NextResponse.json({ campaignUrl: result.campaignUrl });
  } catch (error) {
    console.error("Mayar API error:", error);
    return NextResponse.json(
      { error: "Gagal membuat kampanye Mayar" },
      { status: 500 }
    );
  }
}
