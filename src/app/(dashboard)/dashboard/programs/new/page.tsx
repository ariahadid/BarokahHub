import { createProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";
import Link from "next/link";

export default function NewProgramPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Kembali ke Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-6">Buat Program Ramadhan</h1>
      <ProgramForm action={createProgram} />
    </div>
  );
}
