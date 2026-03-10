import { createProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";

export default function NewProgramPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Program Ramadhan</h1>
      <ProgramForm action={createProgram} />
    </div>
  );
}
