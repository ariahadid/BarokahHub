# BarakahHub Wow Features Design

**Date:** 2026-03-10
**Goal:** Add high-impact features for VIBECODING 2026 hackathon, focused on social impact for small mosques with non-tech-savvy users. Mayar integration as highlight.

## Feature 1: Mayar Auto-Create Campaign

### Problem
Pengurus harus buka Mayar dashboard terpisah, buat kampanye manual, copy-paste URL. Membingungkan user awam.

### Solution
Otomatiskan pembuatan kampanye Mayar langsung dari form program.

### Flow
1. Pengurus buat/edit program → klik tombol **"Buat Link Donasi Mayar"**
2. Sistem panggil Mayar API `createMayarCampaign()` dengan data program (judul, deskripsi AI, target)
3. URL kampanye otomatis tersimpan ke database
4. Di halaman publik, tombol "Donasi Sekarang" langsung muncul — powered by Mayar

### UI Changes (program-form.tsx)
- Ganti input manual URL Mayar → tombol **"Buat Link Donasi Mayar"**
- Setelah link dibuat, tampilkan URL + status "Aktif"
- Tambah field **"Dana Terkumpul (Rp)"** untuk input manual progress donasi

## Feature 2: Progress Bar Donasi

### Schema Change
- `collectedAmount` (integer, nullable) di tabel `programs`

### Public Program Page (`/m/[slug]/[programSlug]`)
- Progress bar emerald di atas deskripsi AI
- Tampilkan: Target, Terkumpul, Persentase
- Jika target belum diisi: hanya "Terkumpul: Rp X" tanpa bar
- Jika belum ada donasi: bar kosong 0%

### Public Mosque Page (`/m/[slug]`)
- Mini progress bar di setiap card program

### Dashboard (`/dashboard`)
- Progress singkat di card program: "Rp X / Rp Y (Z%)"
- Pengurus update collectedAmount dari halaman edit

### Reusable Component
- `src/components/progress-bar.tsx` — accepts `collected`, `target`, `size` (mini/full)

## Feature 3: QR Code Auto-generate

### Implementation
- Library: `qrcode.react` (client-side, no API needed)
- QR points to public program URL: `/m/[slug]/[programSlug]`

### UI (program edit page)
- Card **"QR Code Program"** di bawah card Link Donasi Mayar
- Tampilkan QR code preview
- Tombol **"Download QR"** — download PNG
- Tombol **"Cetak QR"** — print dialog dengan QR + judul + nama masjid + "Scan untuk donasi"

### Component
- `src/components/qr-code-card.tsx`

## Feature 4: Dashboard Ringkasan Masjid

### UI (top of `/dashboard`)
3 summary cards:
- Jumlah Program Aktif
- Total Target Dana
- Total Dana Terkumpul (dengan persentase)

### Data Source
Aggregated from existing programs table, no new tables needed.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/db/schema.ts` | + `collectedAmount` field |
| `src/components/program-form.tsx` | + Mayar auto-create button, + collectedAmount input, + QR code card |
| `src/components/progress-bar.tsx` | New: reusable progress bar component |
| `src/components/qr-code-card.tsx` | New: QR code with download/print |
| `src/lib/actions/program.ts` | Handle collectedAmount in create/update |
| `src/app/(dashboard)/dashboard/page.tsx` | + summary cards, + progress info |
| `src/app/m/[slug]/page.tsx` | + mini progress bar on program cards |
| `src/app/m/[slug]/[programSlug]/page.tsx` | + full progress bar, Mayar branding |

## Dependencies
- `qrcode.react` — QR code generation
