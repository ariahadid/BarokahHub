"use server";

import { db } from "@/lib/db";
import { mosques } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createOrUpdateMosque(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Sesi tidak ditemukan. Silakan login ulang.");

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const contactWhatsapp = formData.get("contactWhatsapp") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Nama masjid wajib diisi.");

  try {
    const existing = await db.query.mosques.findFirst({
      where: eq(mosques.userId, session.user.id),
    });

    const slug = generateSlug(name);

    if (existing) {
      await db
        .update(mosques)
        .set({
          name,
          slug,
          address,
          city,
          contactWhatsapp,
          description,
          updatedAt: new Date(),
        })
        .where(eq(mosques.id, existing.id));
    } else {
      await db.insert(mosques).values({
        name,
        slug,
        address,
        city,
        contactWhatsapp,
        description,
        userId: session.user.id,
      });
    }
  } catch (err) {
    console.error("Error creating/updating mosque:", err);
    throw new Error("Gagal menyimpan data masjid. Pastikan koneksi database sudah benar.");
  }

  redirect("/dashboard");
}

export async function getMosqueByUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.query.mosques.findFirst({
    where: eq(mosques.userId, session.user.id),
  });
}
