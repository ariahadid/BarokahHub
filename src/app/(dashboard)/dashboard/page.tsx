import { getMosqueByUser } from "@/lib/actions/mosque";
import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const mosque = await getMosqueByUser();

  if (!mosque) redirect("/dashboard/mosque/setup");

  const mosquePrograms = await db.query.programs.findMany({
    where: eq(programs.mosqueId, mosque.id),
    orderBy: (programs, { desc }) => [desc(programs.createdAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{mosque.name}</h1>
          <p className="text-muted-foreground">{mosque.city}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/mosque/setup">
            <Button variant="outline" size="sm">
              Edit Masjid
            </Button>
          </Link>
          <Link href="/dashboard/programs/new">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              + Program Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Halaman publik:</span>
        <Link
          href={`/m/${mosque.slug}`}
          className="text-sm text-emerald-600 hover:underline"
        >
          /m/{mosque.slug}
        </Link>
      </div>

      {mosquePrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada program. Klik &quot;+ Program Baru&quot; untuk memulai.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mosquePrograms.map((program) => (
            <Card key={program.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{program.title}</CardTitle>
                  <Badge variant="secondary">{program.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {program.eventDate && <span>{program.eventDate}</span>}
                    {program.targetAmount && (
                      <span>
                        {" "}
                        · Target: Rp{" "}
                        {program.targetAmount.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/programs/${program.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/m/${mosque.slug}/${program.slug}`}>
                      <Button variant="ghost" size="sm">
                        Lihat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
