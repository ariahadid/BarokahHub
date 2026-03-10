import { getProgram, updateProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";
import { notFound } from "next/navigation";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgram(id);
  if (!program) notFound();

  const action = updateProgram.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Program</h1>
      <ProgramForm program={program} action={action} />
    </div>
  );
}
