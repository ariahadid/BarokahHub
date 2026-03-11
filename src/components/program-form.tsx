"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCodeCard } from "@/components/qr-code-card";

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
    slug: string;
    category: string;
    eventDate: string | null;
    targetAmount: number | null;
    collectedAmount: number | null;
    notes: string | null;
    mayarCampaignUrl: string | null;
    mayarPaymentId: string | null;
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

export function ProgramForm({ program, initialData, mosqueSlug, mosqueName, action }: ProgramFormProps) {
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
  const [mayarUrl, setMayarUrl] = useState(program?.mayarCampaignUrl || "");
  const [mayarPaymentId, setMayarPaymentId] = useState(program?.mayarPaymentId || "");
  const [creatingMayar, setCreatingMayar] = useState(false);

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
      if (data.paymentId) setMayarPaymentId(data.paymentId);
    } catch {
      setError("Terjadi kesalahan saat membuat kampanye Mayar");
    } finally {
      setCreatingMayar(false);
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
              defaultValue={program?.title || initialData?.title || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <select
              id="category"
              name="category"
              required
              defaultValue={program?.category || initialData?.category || ""}
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
                defaultValue={program?.targetAmount || initialData?.targetAmount || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Niat / Tujuan Program</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={program?.notes || initialData?.notes || ""}
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
              <input type="hidden" name="mayarPaymentId" value={mayarPaymentId} />
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                {program?.id
                  ? "Klik tombol di atas untuk otomatis membuat kampanye donasi di Mayar."
                  : "Simpan program terlebih dahulu, lalu buat link donasi Mayar."}
              </p>
              <input type="hidden" name="mayarCampaignUrl" value="" />
              <input type="hidden" name="mayarPaymentId" value="" />
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

      {program?.id && mosqueSlug && mosqueName && (
        <QrCodeCard
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/m/${mosqueSlug}/${program.slug}`}
          programTitle={program.title}
          mosqueName={mosqueName}
        />
      )}

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {program ? "Simpan Perubahan" : "Simpan Program"}
      </Button>
    </form>
  );
}
