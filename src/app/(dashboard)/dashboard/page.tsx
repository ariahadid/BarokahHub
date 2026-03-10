import { getMosqueByUser } from "@/lib/actions/mosque";
import { deleteProgram } from "@/lib/actions/program";
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
import { DeleteProgramButton } from "@/components/delete-program-button";

export default async function DashboardPage() {
  const mosque = await getMosqueByUser();

  if (!mosque) redirect("/dashboard/mosque/setup");

  const mosquePrograms = await db.query.programs.findMany({
    where: eq(programs.mosqueId, mosque.id),
    orderBy: (programs, { desc }) => [desc(programs.createdAt)],
  });

  const totalPrograms = mosquePrograms.length;
  const totalTarget = mosquePrograms.reduce((sum, p) => sum + (p.targetAmount || 0), 0);
  const totalCollected = mosquePrograms.reduce((sum, p) => sum + (p.collectedAmount || 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

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

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">Halaman publik:</span>
        <Link
          href={`/m/${mosque.slug}`}
          className="text-sm text-emerald-600 hover:underline"
        >
          /m/{mosque.slug}
        </Link>
      </div>

      {totalPrograms > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Program Aktif</p>
              <p className="text-3xl font-bold text-emerald-700">{totalPrograms}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Target</p>
              <p className="text-2xl font-bold text-emerald-700">
                Rp {totalTarget.toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Terkumpul</p>
              <p className="text-2xl font-bold text-emerald-700">
                Rp {totalCollected.toLocaleString("id-ID")}
              </p>
              {totalTarget > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{overallPercentage}% tercapai</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    {program.targetAmount && program.collectedAmount && program.collectedAmount >= program.targetAmount && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Tercapai</Badge>
                    )}
                  </div>
                  <Badge variant="secondary">{program.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      {program.eventDate && <span>{program.eventDate}</span>}
                      {program.targetAmount && (
                        <span>
                          {program.eventDate && " · "}
                          Target: Rp {program.targetAmount.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    {program.collectedAmount ? (
                      <div className="text-emerald-600 font-medium">
                        Terkumpul: Rp {program.collectedAmount.toLocaleString("id-ID")}
                        {program.targetAmount && (
                          <span> ({Math.round((program.collectedAmount / program.targetAmount) * 100)}%)</span>
                        )}
                      </div>
                    ) : null}
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
                    <DeleteProgramButton
                      action={deleteProgram.bind(null, program.id)}
                      programTitle={program.title}
                    />
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
