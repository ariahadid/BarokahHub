import { getProgram, updateProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMosqueByUser } from "@/lib/actions/mosque";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [program, mosque] = await Promise.all([getProgram(id), getMosqueByUser()]);
  if (!program) notFound();

  const action = updateProgram.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Kembali ke Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Program</h1>
      <ProgramForm
        program={program}
        mosqueSlug={mosque?.slug}
        mosqueName={mosque?.name}
        action={action}
      />
    </div>
  );
}
