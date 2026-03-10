import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { programs, mosques } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateProgramContent } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const program = await db.query.programs.findFirst({
    where: eq(programs.id, id),
  });
  if (!program) {
    return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
  }

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.id, program.mosqueId),
  });
  if (!mosque || mosque.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const content = await generateProgramContent({
      mosqueName: mosque.name,
      mosqueCity: mosque.city,
      mosqueDescription: mosque.description,
      programTitle: program.title,
      programCategory: program.category,
      programEventDate: program.eventDate,
      programTargetAmount: program.targetAmount,
      programNotes: program.notes,
    });

    await db.update(programs)
      .set({
        aiDescription: content.ai_description,
        aiWhatsappText: content.ai_whatsapp_text,
        aiInstagramCaption: content.ai_instagram_caption,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id));

    return NextResponse.json(content);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Gagal generate konten. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
