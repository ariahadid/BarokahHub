"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgramData {
  title: string;
  category: string;
  targetAmount: number | null;
  collectedAmount: number | null;
}

interface AnalyticsChartsProps {
  programs: ProgramData[];
}

const categoryColors: Record<string, string> = {
  "Buka Puasa": "#059669",
  Sahur: "#0891b2",
  Santunan: "#7c3aed",
  Kajian: "#dc2626",
  Zakat: "#ea580c",
  Qurban: "#ca8a04",
  Lainnya: "#64748b",
};

function getCategoryColor(category: string): string {
  return categoryColors[category] ?? categoryColors["Lainnya"];
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  }
  return value.toLocaleString("id-ID");
}

function BarChart({ programs }: { programs: ProgramData[] }) {
  const filtered = programs.filter(
    (p) => p.targetAmount != null && p.targetAmount > 0
  );

  if (filtered.length === 0) return null;

  const maxValue = Math.max(
    ...filtered.map((p) =>
      Math.max(p.targetAmount ?? 0, p.collectedAmount ?? 0)
    )
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target vs Terkumpul</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.map((program, i) => {
            const target = program.targetAmount ?? 0;
            const collected = program.collectedAmount ?? 0;
            const targetWidth = Math.max((target / maxValue) * 100, 2);
            const collectedWidth = Math.max((collected / maxValue) * 100, 2);

            return (
              <div key={i} className="space-y-1">
                <div className="text-sm font-medium truncate">
                  {program.title}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 rounded bg-emerald-200"
                    style={{ width: `${targetWidth}%` }}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRupiah(target)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 rounded bg-emerald-600"
                    style={{ width: `${collectedWidth}%` }}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRupiah(collected)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-200" />
            <span>Target</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-600" />
            <span>Terkumpul</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DonutChart({ programs }: { programs: ProgramData[] }) {
  if (programs.length < 2) return null;

  const categoryCounts: Record<string, number> = {};
  for (const p of programs) {
    const cat = p.category || "Lainnya";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  const entries = Object.entries(categoryCounts);
  const total = programs.length;

  // Build conic-gradient stops
  const gradientStops: string[] = [];
  let cumulative = 0;
  for (const [cat, count] of entries) {
    const startPct = cumulative;
    const endPct = cumulative + (count / total) * 100;
    const color = getCategoryColor(cat);
    gradientStops.push(`${color} ${startPct}% ${endPct}%`);
    cumulative = endPct;
  }

  const gradient = `conic-gradient(${gradientStops.join(", ")})`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div
            className="relative w-40 h-40 rounded-full"
            style={{ background: gradient }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold">{total}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
            {entries.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(cat) }}
                />
                <span>
                  {cat} ({count})
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
  const hasBarData =
    programs.filter((p) => p.targetAmount != null && p.targetAmount > 0)
      .length > 0;
  const hasDonutData = programs.length >= 2;

  if (!hasBarData && !hasDonutData) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <BarChart programs={programs} />
      <DonutChart programs={programs} />
    </div>
  );
}
