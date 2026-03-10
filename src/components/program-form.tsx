"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = [
  { value: "buka_puasa", label: "Buka Puasa" },
  { value: "santunan", label: "Santunan" },
  { value: "kajian", label: "Kajian" },
  { value: "renovasi", label: "Renovasi" },
  { value: "lainnya", label: "Lainnya" },
];

interface ProgramFormProps {
  program?: {
    id: string;
    title: string;
    category: string;
    eventDate: string | null;
    targetAmount: number | null;
    notes: string | null;
    mayarCampaignUrl: string | null;
    aiDescription: string | null;
    aiWhatsappText: string | null;
    aiInstagramCaption: string | null;
  };
  action: (formData: FormData) => Promise<void>;
}

export function ProgramForm({ program, action }: ProgramFormProps) {
  const [aiDescription, setAiDescription] = useState(
    program?.aiDescription || ""
  );
  const [aiWhatsappText, setAiWhatsappText] = useState(
    program?.aiWhatsappText || ""
  );
  const [aiInstagramCaption, setAiInstagramCaption] = useState(
    program?.aiInstagramCaption || ""
  );
  const [generating, setGenerating] = useState(false);
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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <form action={action} className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Detail Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Program *</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={program?.title || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <select
              id="category"
              name="category"
              required
              defaultValue={program?.category || ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                defaultValue={program?.eventDate || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Dana (Rp)</Label>
              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                defaultValue={program?.targetAmount || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Niat / Tujuan Program</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={program?.notes || ""}
              placeholder="Jelaskan singkat tujuan program ini..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Konten AI</CardTitle>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="text-emerald-600 border-emerald-600"
            >
              {generating ? "Generating..." : "Generate Konten AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiDescription">Deskripsi Program</Label>
            <Textarea
              id="aiDescription"
              name="aiDescription"
              rows={6}
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiWhatsappText">Teks Broadcast WhatsApp</Label>
              {aiWhatsappText && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(aiWhatsappText)}
                >
                  Copy
                </Button>
              )}
            </div>
            <Textarea
              id="aiWhatsappText"
              name="aiWhatsappText"
              rows={6}
              value={aiWhatsappText}
              onChange={(e) => setAiWhatsappText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiInstagramCaption">Caption Instagram</Label>
              {aiInstagramCaption && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(aiInstagramCaption)}
                >
                  Copy
                </Button>
              )}
            </div>
            <Textarea
              id="aiInstagramCaption"
              name="aiInstagramCaption"
              rows={4}
              value={aiInstagramCaption}
              onChange={(e) => setAiInstagramCaption(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Donasi Mayar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="mayarCampaignUrl">URL Kampanye Mayar</Label>
          <Input
            id="mayarCampaignUrl"
            name="mayarCampaignUrl"
            defaultValue={program?.mayarCampaignUrl || ""}
            placeholder="https://masjid.mayar.id/program-anda"
          />
          <p className="text-xs text-muted-foreground">
            Buat kampanye donasi di dashboard Mayar, lalu paste link-nya di
            sini.
          </p>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {program ? "Simpan Perubahan" : "Simpan Program"}
      </Button>
    </form>
  );
}
