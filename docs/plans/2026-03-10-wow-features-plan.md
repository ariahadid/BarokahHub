# Wow Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Mayar auto-create campaign, donation progress bar, QR code generation, and dashboard summary to BarakahHub.

**Architecture:** All features build on existing schema + components. One new DB field (`collectedAmount`), two new components (progress bar, QR card), and modifications to existing form/pages. No new tables or API routes needed — Mayar auto-create reuses existing `/api/mayar/create-campaign` route.

**Tech Stack:** Next.js 16, React 19, Drizzle ORM, TailwindCSS 4, Shadcn/ui, `qrcode.react`

---

### Task 1: Add `collectedAmount` to schema and push

**Files:**
- Modify: `src/lib/db/schema.ts:33-48`

**Step 1: Add collectedAmount field to programs table**

In `src/lib/db/schema.ts`, add after line 42 (`notes: text("notes"),`):

```typescript
collectedAmount: integer("collected_amount"),
```

**Step 2: Push schema to database**

Run: `npx drizzle-kit push`
Expected: Schema updated, `collected_amount` column added to `programs` table.

**Step 3: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add collectedAmount field to programs schema"
```

---

### Task 2: Update server actions to handle `collectedAmount`

**Files:**
- Modify: `src/lib/actions/program.ts:42-74`

**Step 1: Add collectedAmount to `updateProgram`**

In `src/lib/actions/program.ts`, after line 54 (`const aiInstagramCaption = ...`), add:

```typescript
const collectedAmount = formData.get("collectedAmount") as string;
```

In the `.set({...})` block, after line 68 (`aiInstagramCaption: aiInstagramCaption || null,`), add:

```typescript
collectedAmount: collectedAmount ? parseInt(collectedAmount) : null,
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/lib/actions/program.ts
git commit -m "feat: handle collectedAmount in updateProgram action"
```

---

### Task 3: Create reusable DonationProgress component

**Files:**
- Create: `src/components/donation-progress.tsx`

**Step 1: Create the component**

Create `src/components/donation-progress.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface DonationProgressProps {
  collected: number;
  target: number | null;
  size?: "mini" | "full";
}

export function DonationProgress({ collected, target, size = "full" }: DonationProgressProps) {
  const percentage = target ? Math.min(Math.round((collected / target) * 100), 100) : null;

  if (size === "mini") {
    return (
      <div className="w-full">
        {target ? (
          <>
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rp {collected.toLocaleString("id-ID")} / Rp {target.toLocaleString("id-ID")} ({percentage}%)
            </p>
          </>
        ) : collected > 0 ? (
          <p className="text-xs text-muted-foreground">
            Terkumpul: Rp {collected.toLocaleString("id-ID")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg p-6 border")}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">Dana Terkumpul</p>
        {percentage !== null && (
          <span className="text-sm font-bold text-emerald-600">{percentage}%</span>
        )}
      </div>
      <p className="text-2xl font-bold text-emerald-700 mb-3">
        Rp {collected.toLocaleString("id-ID")}
      </p>
      {target && (
        <>
          <div className="h-3 bg-emerald-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Target: Rp {target.toLocaleString("id-ID")}
          </p>
        </>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/donation-progress.tsx
git commit -m "feat: add reusable DonationProgress component"
```

---

### Task 4: Install qrcode.react and create QrCodeCard component

**Files:**
- Create: `src/components/qr-code-card.tsx`

**Step 1: Install dependency**

Run: `npm install qrcode.react`

**Step 2: Create the component**

Create `src/components/qr-code-card.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QrCodeCardProps {
  url: string;
  programTitle: string;
  mosqueName: string;
}

export function QrCodeCard({ url, programTitle, mosqueName }: QrCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);

      const link = document.createElement("a");
      link.download = `qr-${programTitle.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgHtml = svg.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR Code - ${programTitle}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;margin:0;">
          <h2 style="margin-bottom:8px;">${programTitle}</h2>
          <p style="color:#666;margin-bottom:24px;">${mosqueName}</p>
          <div style="width:300px;height:300px;">${svgHtml}</div>
          <p style="margin-top:24px;color:#059669;font-weight:bold;font-size:18px;">Scan untuk donasi</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div ref={qrRef} className="bg-white p-4 rounded-lg border">
            <QRCodeSVG value={url} size={200} level="M" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Jamaah scan QR ini untuk langsung buka halaman program
          </p>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              Download QR
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handlePrint}
            >
              Cetak QR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add package.json package-lock.json src/components/qr-code-card.tsx
git commit -m "feat: add QrCodeCard component with download and print"
```

---

### Task 5: Update ProgramForm — Mayar auto-create, collectedAmount, QR code

**Files:**
- Modify: `src/components/program-form.tsx`

**Step 1: Update the ProgramFormProps interface**

Replace the existing `ProgramFormProps` interface (lines 18-32) with:

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
  mosqueSlug?: string;
  mosqueName?: string;
  action: (formData: FormData) => Promise<void>;
}
```

**Step 2: Update the component function**

Replace the entire `ProgramForm` function with:

```tsx
export function ProgramForm({ program, mosqueSlug, mosqueName, action }: ProgramFormProps) {
  const [aiDescription, setAiDescription] = useState(
    program?.aiDescription || ""
  );
  const [aiWhatsappText, setAiWhatsappText] = useState(
    program?.aiWhatsappText || ""
  );
  const [aiInstagramCaption, setAiInstagramCaption] = useState(
    program?.aiInstagramCaption || ""
  );
  const [mayarUrl, setMayarUrl] = useState(program?.mayarCampaignUrl || "");
  const [generating, setGenerating] = useState(false);
  const [creatingMayar, setCreatingMayar] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!program?.id) {
      setError("Simpan program terlebih dahulu sebelum generate konten AI");
      return;
    }
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/programs/${program.id}/generate`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal generate konten");
        return;
      }

      setAiDescription(data.ai_description);
      setAiWhatsappText(data.ai_whatsapp_text);
      setAiInstagramCaption(data.ai_instagram_caption);
    } catch {
      setError("Terjadi kesalahan saat generate konten");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateMayar() {
    if (!program?.id) {
      setError("Simpan program terlebih dahulu sebelum buat link donasi");
      return;
    }
    setCreatingMayar(true);
    setError("");

    try {
      const res = await fetch("/api/mayar/create-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: program.title,
          description: aiDescription || program.title,
          targetAmount: program.targetAmount,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat link donasi Mayar");
        return;
      }

      setMayarUrl(data.campaignUrl);
    } catch {
      setError("Terjadi kesalahan saat membuat kampanye Mayar");
    } finally {
      setCreatingMayar(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
```

**Step 3: Replace the Mayar Card section**

Replace the entire Mayar Card (lines 221-238 in original, the `<Card>` with "Link Donasi Mayar") with:

```tsx
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Link Donasi Mayar</CardTitle>
            {!mayarUrl && (
              <Button
                type="button"
                onClick={handleCreateMayar}
                disabled={creatingMayar || !program?.id}
                variant="outline"
                className="text-emerald-600 border-emerald-600"
              >
                {creatingMayar ? "Membuat..." : "Buat Link Donasi Mayar"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mayarUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Aktif</span>
                <a
                  href={mayarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:underline truncate"
                >
                  {mayarUrl}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(mayarUrl)}
                >
                  Copy
                </Button>
              </div>
              <input type="hidden" name="mayarCampaignUrl" value={mayarUrl} />
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                {program?.id
                  ? "Klik tombol di atas untuk otomatis membuat kampanye donasi di Mayar."
                  : "Simpan program terlebih dahulu, lalu buat link donasi Mayar."}
              </p>
              <input type="hidden" name="mayarCampaignUrl" value="" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="collectedAmount">Dana Terkumpul (Rp)</Label>
            <Input
              id="collectedAmount"
              name="collectedAmount"
              type="number"
              defaultValue={program?.collectedAmount || ""}
              placeholder="Masukkan jumlah dana yang sudah terkumpul"
            />
            <p className="text-xs text-muted-foreground">
              Update jumlah donasi yang sudah terkumpul untuk ditampilkan di halaman publik.
            </p>
          </div>
        </CardContent>
      </Card>
```

**Step 4: Add QR Code Card after the Mayar Card, before the submit button**

After the Mayar Card closing `</Card>` and before the `<Button type="submit"...>`, add:

```tsx
      {program?.id && mosqueSlug && mosqueName && (
        <QrCodeCard
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/m/${mosqueSlug}/${program.slug}`}
          programTitle={program.title}
          mosqueName={mosqueName}
        />
      )}
```

**Step 5: Add the import for QrCodeCard at the top**

Add to imports:

```tsx
import { QrCodeCard } from "@/components/qr-code-card";
```

**Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add src/components/program-form.tsx
git commit -m "feat: add Mayar auto-create, collectedAmount input, and QR code to program form"
```

---

### Task 6: Pass mosqueSlug and mosqueName to ProgramForm from edit page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/programs/[id]/page.tsx`

**Step 1: Update the edit page to fetch mosque data and pass to form**

Replace the entire file content with:

```tsx
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/programs/[id]/page.tsx
git commit -m "feat: pass mosque data to ProgramForm for QR code"
```

---

### Task 7: Add progress bar to public program page

**Files:**
- Modify: `src/app/m/[slug]/[programSlug]/page.tsx`

**Step 1: Replace the info grid and add progress bar**

Replace the entire file content with:

```tsx
import { db } from "@/lib/db";
import { mosques, programs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DonationProgress } from "@/components/donation-progress";
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

  const collected = program.collectedAmount || 0;

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

      {program.eventDate && (
        <div className="bg-white rounded-lg p-4 border mb-4">
          <p className="text-sm text-muted-foreground">Tanggal</p>
          <p className="font-medium">{program.eventDate}</p>
        </div>
      )}

      {(collected > 0 || program.targetAmount) && (
        <div className="mb-6">
          <DonationProgress collected={collected} target={program.targetAmount} size="full" />
        </div>
      )}

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
              Pembayaran aman melalui Mayar
            </p>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/m/[slug]/[programSlug]/page.tsx
git commit -m "feat: add donation progress bar to public program page"
```

---

### Task 8: Add mini progress bar to public mosque page

**Files:**
- Modify: `src/app/m/[slug]/page.tsx`

**Step 1: Add DonationProgress import and mini bars to program cards**

Replace the entire file content with:

```tsx
import { db } from "@/lib/db";
import { mosques, programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonationProgress } from "@/components/donation-progress";

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
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {program.aiDescription || program.notes || ""}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {program.eventDate && <span>{program.eventDate}</span>}
                    {program.targetAmount && !program.collectedAmount && (
                      <span> · Target: Rp {program.targetAmount.toLocaleString("id-ID")}</span>
                    )}
                  </div>
                  {(program.collectedAmount || (program.targetAmount && program.collectedAmount)) ? (
                    <DonationProgress
                      collected={program.collectedAmount || 0}
                      target={program.targetAmount}
                      size="mini"
                    />
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/m/[slug]/page.tsx
git commit -m "feat: add mini donation progress to public mosque page"
```

---

### Task 9: Add dashboard summary cards and progress info

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

**Step 1: Replace entire file with summary cards + progress in program cards**

```tsx
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
                  <CardTitle className="text-lg">{program.title}</CardTitle>
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: add dashboard summary cards with donation progress"
```

---

### Task 10: Final verification

**Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds with zero errors.

**Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

**Step 3: Run dev server and verify manually**

Run: `npm run dev`
Verify:
- Dashboard shows summary cards (program count, total target, total collected)
- Program edit form has "Buat Link Donasi Mayar" button
- Program edit form has "Dana Terkumpul" input field
- Program edit form shows QR code card with download/print buttons
- Public program page shows progress bar
- Public mosque page shows mini progress bars on cards
