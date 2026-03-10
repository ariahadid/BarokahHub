"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DeleteProgramButtonProps {
  action: () => Promise<void>;
  programTitle: string;
}

export function DeleteProgramButton({ action, programTitle }: DeleteProgramButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-600">Hapus &quot;{programTitle}&quot;?</span>
        <form action={action}>
          <Button type="submit" variant="destructive" size="sm">
            Ya
          </Button>
        </form>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Batal
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={() => setConfirming(true)}
    >
      Hapus
    </Button>
  );
}
