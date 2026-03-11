# Program Templates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add pre-built Ramadhan program templates so users can create programs with one click instead of filling forms from scratch.

**Architecture:** Template data lives in a simple TypeScript module. A client-side wrapper component on the new-program page shows a template picker grid; selecting a template (or "Mulai dari Nol") renders ProgramForm with `key={templateId}` to force remount with pre-filled `defaultValue`s. No schema or server action changes needed.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, Shadcn/ui Card/Badge

---

### Task 1: Create Template Data Module

**Files:**
- Create: `src/lib/program-templates.ts`

**Step 1: Create the template data file**

Create `src/lib/program-templates.ts`:

```tsx
export interface ProgramTemplate {
  id: string;
  emoji: string;
  title: string;
  category: string;
  categoryLabel: string;
  targetAmount: number;
  notes: string;
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: "buka-puasa",
    emoji: "🍽️",
    title: "Buka Puasa Bersama",
    category: "buka_puasa",
    categoryLabel: "Buka Puasa",
    targetAmount: 5_000_000,
    notes: "Menyediakan takjil dan makanan berbuka untuk jamaah dan warga sekitar",
  },
  {
    id: "sahur-on-the-road",
    emoji: "🌙",
    title: "Sahur on the Road",
    category: "buka_puasa",
    categoryLabel: "Buka Puasa",
    targetAmount: 3_000_000,
    notes: "Membagikan paket sahur untuk pekerja malam dan warga kurang mampu",
  },
  {
    id: "santunan-yatim",
    emoji: "🤝",
    title: "Santunan Anak Yatim",
    category: "santunan",
    categoryLabel: "Santunan",
    targetAmount: 10_000_000,
    notes: "Memberikan santunan berupa uang dan perlengkapan sekolah untuk anak yatim",
  },
  {
    id: "kajian-ramadhan",
    emoji: "📖",
    title: "Kajian Ramadhan Rutin",
    category: "kajian",
    categoryLabel: "Kajian",
    targetAmount: 2_000_000,
    notes: "Mengadakan kajian rutin setiap malam Ramadhan bersama ustadz",
  },
  {
    id: "renovasi-masjid",
    emoji: "🏗️",
    title: "Renovasi Masjid Ramadhan",
    category: "renovasi",
    categoryLabel: "Renovasi",
    targetAmount: 15_000_000,
    notes: "Dana renovasi dan perbaikan fasilitas masjid menjelang Ramadhan",
  },
  {
    id: "paket-sembako",
    emoji: "📦",
    title: "Paket Sembako Ramadhan",
    category: "santunan",
    categoryLabel: "Santunan",
    targetAmount: 8_000_000,
    notes: "Membagikan paket sembako kepada warga kurang mampu di sekitar masjid",
  },
];
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/program-templates.ts
git commit -m "feat: add program template data"
```

---

### Task 2: Create New Program Page with Template Picker

**Files:**
- Modify: `src/app/(dashboard)/dashboard/programs/new/page.tsx`

The current page is a simple server component:
```tsx
// Current (lines 1-18):
import { createProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";
import Link from "next/link";

export default function NewProgramPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        &larr; Kembali ke Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-6">Buat Program Ramadhan</h1>
      <ProgramForm action={createProgram} />
    </div>
  );
}
```

**Step 1: Rewrite the page**

Replace the entire content of `src/app/(dashboard)/dashboard/programs/new/page.tsx` with:

```tsx
import { createProgram } from "@/lib/actions/program";
import Link from "next/link";
import { NewProgramWithTemplates } from "@/components/new-program-with-templates";

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
      <NewProgramWithTemplates action={createProgram} />
    </div>
  );
}
```

**Step 2: Create the wrapper client component**

Create `src/components/new-program-with-templates.tsx`:

```tsx
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
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: Error — ProgramForm does not accept `initialData` prop yet. This is fixed in Task 3.

---

### Task 3: Add initialData Prop to ProgramForm

**Files:**
- Modify: `src/components/program-form.tsx:19-37,129-183`

**Step 1: Add initialData to ProgramFormProps interface**

In `src/components/program-form.tsx`, find the `ProgramFormProps` interface (lines 19-37) and add `initialData` as an optional prop:

```tsx
interface ProgramFormProps {
  program?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    eventDate: string | null;
    targetAmount: number | null;
    collectedAmount: number | null;
    notes: string | null;
    mayarCampaignUrl: string | null;
    aiDescription: string | null;
    aiWhatsappText: string | null;
    aiInstagramCaption: string | null;
  };
  initialData?: {
    title: string;
    category: string;
    targetAmount: number;
    notes: string;
  };
  mosqueSlug?: string;
  mosqueName?: string;
  action: (formData: FormData) => Promise<void>;
}
```

**Step 2: Update component signature to destructure initialData**

Change line 39 from:
```tsx
export function ProgramForm({ program, mosqueSlug, mosqueName, action }: ProgramFormProps) {
```
to:
```tsx
export function ProgramForm({ program, initialData, mosqueSlug, mosqueName, action }: ProgramFormProps) {
```

**Step 3: Use initialData as fallback in form defaultValues**

Update the `defaultValue` attributes in the form fields to fall back to `initialData`:

- Title input (around line 135): change `defaultValue={program?.title || ""}` to `defaultValue={program?.title || initialData?.title || ""}`
- Category select (around line 144): change `defaultValue={program?.category || ""}` to `defaultValue={program?.category || initialData?.category || ""}`
- Target amount input (around line 170): change `defaultValue={program?.targetAmount || ""}` to `defaultValue={program?.targetAmount || initialData?.targetAmount || ""}`
- Notes textarea (around line 180): change `defaultValue={program?.notes || ""}` to `defaultValue={program?.notes || initialData?.notes || ""}`

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 5: Commit**

```bash
git add src/lib/program-templates.ts src/components/new-program-with-templates.tsx src/components/program-form.tsx src/app/(dashboard)/dashboard/programs/new/page.tsx
git commit -m "feat: add program templates with pre-filled form"
```

---

### Task 4: Build Verification

**Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

**Step 3: Manual verification**

Run: `npm run dev`
Visit: `http://localhost:3000/dashboard/programs/new`
Expected:
- See 6 template cards in a 2-column grid with emoji, title, category badge, target amount
- See "Mulai dari Nol" button below the grid
- Click a template → form appears with title, category, target, and notes pre-filled
- "Pilih template lain" link at top to go back to picker
- Click "Mulai dari Nol" → empty form appears

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: resolve build errors for program templates"
```
