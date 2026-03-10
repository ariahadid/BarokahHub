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
