"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramForm } from "@/components/program-form";
import { PROGRAM_TEMPLATES, type ProgramTemplate } from "@/lib/program-templates";

interface NewProgramWithTemplatesProps {
  action: (formData: FormData) => Promise<void>;
}

export function NewProgramWithTemplates({ action }: NewProgramWithTemplatesProps) {
  const [selected, setSelected] = useState<ProgramTemplate | "blank" | null>(null);

  if (selected) {
    const template = selected === "blank" ? undefined : selected;
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm text-emerald-600 hover:underline mb-4 inline-block"
        >
          &larr; Pilih template lain
        </button>
        <ProgramForm
          key={template?.id || "blank"}
          action={action}
          initialData={
            template
              ? {
                  title: template.title,
                  category: template.category,
                  targetAmount: template.targetAmount,
                  notes: template.notes,
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-4">
        Pilih template untuk memulai, atau buat program dari nol.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {PROGRAM_TEMPLATES.map((t) => (
          <Card
            key={t.id}
            className="cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
            onClick={() => setSelected(t)}
          >
            <CardContent className="pt-5 pb-4">
              <div className="text-3xl mb-2">{t.emoji}</div>
              <p className="font-semibold text-sm mb-1">{t.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {t.categoryLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Rp {t.targetAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setSelected("blank")}
      >
        Mulai dari Nol
      </Button>
    </div>
  );
}
