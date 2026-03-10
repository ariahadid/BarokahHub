import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMayarCampaign } from "@/lib/mayar";
import { db } from "@/lib/db";
import { mosques } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    // Get mosque data for contact info
    const mosque = await db.query.mosques.findFirst({
      where: eq(mosques.userId, session.user.id),
    });

    const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || "https://localhost:3000";

    // Mayar max description is 555 characters
    const trimmedDescription = (description || name).slice(0, 550);

    const result = await createMayarCampaign({
      name,
      email: session.user.email || "noreply@barakahhub.id",
      mobile: mosque?.contactWhatsapp || "08000000000",
      description: trimmedDescription,
      targetAmount,
      redirectUrl: mosque ? `${origin}/m/${mosque.slug}` : origin,
    });

    return NextResponse.json({ campaignUrl: result.campaignUrl });
  } catch (error) {
    console.error("Mayar API error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat kampanye Mayar";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
