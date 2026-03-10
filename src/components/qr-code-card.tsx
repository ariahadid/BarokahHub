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
