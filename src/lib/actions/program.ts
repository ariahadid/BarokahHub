"use server";

import { db } from "@/lib/db";
import { programs, mosques } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createProgram(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.userId, session.user.id),
  });
  if (!mosque) throw new Error("Daftarkan masjid terlebih dahulu");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const eventDate = formData.get("eventDate") as string;
  const targetAmount = formData.get("targetAmount") as string;
  const notes = formData.get("notes") as string;

  if (!title || !category) throw new Error("Judul dan kategori wajib diisi");

  const slug = generateSlug(title);

  await db.insert(programs).values({
    mosqueId: mosque.id,
    title,
    slug,
    category,
    eventDate: eventDate || null,
    targetAmount: targetAmount ? parseInt(targetAmount) : null,
    notes: notes || null,
  });

  redirect("/dashboard");
}

export async function updateProgram(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const eventDate = formData.get("eventDate") as string;
  const targetAmount = formData.get("targetAmount") as string;
  const notes = formData.get("notes") as string;
  const mayarCampaignUrl = formData.get("mayarCampaignUrl") as string;
  const aiDescription = formData.get("aiDescription") as string;
  const aiWhatsappText = formData.get("aiWhatsappText") as string;
  const aiInstagramCaption = formData.get("aiInstagramCaption") as string;

  await db
    .update(programs)
    .set({
      title,
      slug: generateSlug(title),
      category,
      eventDate: eventDate || null,
      targetAmount: targetAmount ? parseInt(targetAmount) : null,
      notes: notes || null,
      mayarCampaignUrl: mayarCampaignUrl || null,
      aiDescription: aiDescription || null,
      aiWhatsappText: aiWhatsappText || null,
      aiInstagramCaption: aiInstagramCaption || null,
      updatedAt: new Date(),
    })
    .where(eq(programs.id, id));

  redirect("/dashboard");
}

export async function getProgram(id: string) {
  return db.query.programs.findFirst({
    where: eq(programs.id, id),
  });
}
