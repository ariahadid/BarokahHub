"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function MosqueSetupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message || "Terjadi kesalahan saat mendaftarkan masjid.";

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Gagal Mendaftarkan Masjid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Coba Lagi
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost">Kembali ke Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
