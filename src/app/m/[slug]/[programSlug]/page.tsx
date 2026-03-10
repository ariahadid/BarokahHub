import { db } from "@/lib/db";
import { mosques, programs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default async function PublicProgramPage({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
}) {
  const { slug, programSlug } = await params;

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.slug, slug),
  });
  if (!mosque) notFound();

  const program = await db.query.programs.findFirst({
    where: and(
      eq(programs.mosqueId, mosque.id),
      eq(programs.slug, programSlug)
    ),
  });
  if (!program) notFound();

  return (
    <div>
      <Link href={`/m/${slug}`} className="text-sm text-emerald-600 hover:underline mb-4 inline-block">
        &larr; Kembali ke {mosque.name}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-emerald-800">{program.title}</h1>
          <Badge variant="secondary">{program.category}</Badge>
        </div>
        <p className="text-muted-foreground">{mosque.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {program.eventDate && (
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">Tanggal</p>
            <p className="font-medium">{program.eventDate}</p>
          </div>
        )}
        {program.targetAmount && (
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">Target Dana</p>
            <p className="font-medium">Rp {program.targetAmount.toLocaleString("id-ID")}</p>
          </div>
        )}
      </div>

      {program.aiDescription && (
        <div className="prose prose-slate max-w-none mb-8">
          {program.aiDescription.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {program.mayarCampaignUrl && (
        <>
          <Separator className="my-8" />
          <div className="text-center">
            <a href={program.mayarCampaignUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
                Donasi Sekarang
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Anda akan diarahkan ke halaman pembayaran Mayar
            </p>
          </div>
        </>
      )}
    </div>
  );
}
