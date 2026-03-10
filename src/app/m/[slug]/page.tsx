import { db } from "@/lib/db";
import { mosques, programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PublicMosquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.slug, slug),
  });
  if (!mosque) notFound();

  const mosquePrograms = await db.query.programs.findMany({
    where: eq(programs.mosqueId, mosque.id),
    orderBy: (programs, { desc }) => [desc(programs.createdAt)],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-800">{mosque.name}</h1>
        {mosque.city && <p className="text-muted-foreground mt-1">{mosque.address ? `${mosque.address}, ` : ""}{mosque.city}</p>}
        {mosque.description && <p className="mt-3 text-slate-700">{mosque.description}</p>}
        {mosque.contactWhatsapp && (
          <a href={`https://wa.me/${mosque.contactWhatsapp.replace(/^0/, "62")}`}
            className="inline-block mt-3 text-sm text-emerald-600 hover:underline"
            target="_blank" rel="noopener">
            Chat WhatsApp
          </a>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Program Ramadhan</h2>

      {mosquePrograms.length === 0 ? (
        <p className="text-muted-foreground">Belum ada program.</p>
      ) : (
        <div className="grid gap-4">
          {mosquePrograms.map((program) => (
            <Link key={program.id} href={`/m/${slug}/${program.slug}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <Badge variant="secondary">{program.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {program.aiDescription || program.notes || ""}
                  </p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {program.eventDate && <span>{program.eventDate}</span>}
                    {program.targetAmount && <span> · Target: Rp {program.targetAmount.toLocaleString("id-ID")}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
