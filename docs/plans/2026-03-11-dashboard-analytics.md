# Dashboard Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add visual analytics charts (horizontal bar chart + donut chart) to the mosque dashboard using pure CSS — no chart libraries.

**Architecture:** Create a single `analytics-charts.tsx` client component containing both charts, then import it into the existing dashboard page. Data is passed as props from the server component. Bar chart uses div widths for proportional bars. Donut chart uses CSS `conic-gradient`.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, Shadcn/ui Card, CSS conic-gradient

---

### Task 1: Create Analytics Charts Component

**Files:**
- Create: `src/components/analytics-charts.tsx`

**Step 1: Create the component file**

Create `src/components/analytics-charts.tsx` with this content:

```tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProgramData {
  title: string;
  category: string;
  targetAmount: number | null;
  collectedAmount: number | null;
}

interface AnalyticsChartsProps {
  programs: ProgramData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Buka Puasa": "#059669",
  "Sahur": "#0891b2",
  "Santunan": "#7c3aed",
  "Kajian": "#dc2626",
  "Zakat": "#ea580c",
  "Qurban": "#ca8a04",
  "Lainnya": "#64748b",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["Lainnya"];
}

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")} jt`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} rb`;
  }
  return amount.toLocaleString("id-ID");
}

function BarChart({ programs }: { programs: ProgramData[] }) {
  const programsWithTarget = programs.filter((p) => p.targetAmount && p.targetAmount > 0);
  if (programsWithTarget.length === 0) return null;

  const maxAmount = Math.max(
    ...programsWithTarget.map((p) => Math.max(p.targetAmount || 0, p.collectedAmount || 0))
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Target vs Terkumpul</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {programsWithTarget.map((program, i) => {
          const target = program.targetAmount || 0;
          const collected = program.collectedAmount || 0;
          const targetWidth = maxAmount > 0 ? (target / maxAmount) * 100 : 0;
          const collectedWidth = maxAmount > 0 ? (collected / maxAmount) * 100 : 0;

          return (
            <div key={i}>
              <p className="text-sm font-medium mb-1.5 truncate">{program.title}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-emerald-100 rounded" style={{ width: `${Math.max(targetWidth, 2)}%` }}>
                    <div className="h-full bg-emerald-200 rounded" style={{ width: "100%" }} />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Rp {formatRupiah(target)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 rounded" style={{ width: `${Math.max(collectedWidth, 2)}%` }}>
                    <div className="h-full bg-emerald-600 rounded" style={{ width: "100%" }} />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Rp {formatRupiah(collected)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-200 rounded" />
            <span>Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-600 rounded" />
            <span>Terkumpul</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DonutChart({ programs }: { programs: ProgramData[] }) {
  if (programs.length < 2) return null;

  const categoryCount: Record<string, number> = {};
  for (const p of programs) {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  }

  const categories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const total = programs.length;

  // Build conic-gradient stops
  let currentDeg = 0;
  const stops: string[] = [];
  for (const [category, count] of categories) {
    const deg = (count / total) * 360;
    const color = getCategoryColor(category);
    stops.push(`${color} ${currentDeg}deg ${currentDeg + deg}deg`);
    currentDeg += deg;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Kategori Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-36 h-36 rounded-full"
              style={{ background: `conic-gradient(${stops.join(", ")})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-slate-700">{total}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {categories.map(([category, count]) => (
              <div key={category} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span className="text-muted-foreground">
                  {category} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsCharts({ programs }: AnalyticsChartsProps) {
  const hasBarData = programs.some((p) => p.targetAmount && p.targetAmount > 0);
  const hasDonutData = programs.length >= 2;

  if (!hasBarData && !hasDonutData) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <BarChart programs={programs} />
      <DonutChart programs={programs} />
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/analytics-charts.tsx
git commit -m "feat: add analytics charts component (bar + donut)"
```

---

### Task 2: Integrate Charts into Dashboard Page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx:1-17,103-104`

**Step 1: Add import and render AnalyticsCharts**

In `src/app/(dashboard)/dashboard/page.tsx`:

1. Add import at the top (after existing imports, line 16):
```tsx
import { AnalyticsCharts } from "@/components/analytics-charts";
```

2. Add the charts section after the stats cards closing `)}` (after line 103) and before the program list section:
```tsx
      {totalPrograms > 0 && (
        <AnalyticsCharts
          programs={mosquePrograms.map((p) => ({
            title: p.title,
            category: p.category,
            targetAmount: p.targetAmount,
            collectedAmount: p.collectedAmount,
          }))}
        />
      )}
```

**Step 2: Verify it renders**

Run: `npm run dev`
Visit: `http://localhost:3000/dashboard`
Expected: Below the stats cards, a 2-column grid with bar chart (left) and donut chart (right). Bar chart shows target vs collected per program. Donut chart shows category distribution.

**Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: integrate analytics charts into dashboard"
```

---

### Task 3: Build Verification

**Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

**Step 3: Final commit (if any fixes needed)**

Fix any errors, then:
```bash
git add -A
git commit -m "fix: resolve build errors for dashboard analytics"
```
