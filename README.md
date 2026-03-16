# BarakahHub

Platform Masjid Indonesia untuk membuat halaman program Ramadhan dengan konten AI dan menerima donasi.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- TailwindCSS 4 + Shadcn/ui v4
- SQLite (Turso) + Drizzle ORM
- NextAuth v5
- AI: Sumopod (GPT-4o-mini)
- Payments: Mayar

## Getting Started

```bash
npm install
npx drizzle-kit push
npm run dev
```

## Fitur

- Buat halaman Masjid dengan slug kustom
- Generate konten program Ramadhan dengan AI (deskripsi, teks WhatsApp, caption Instagram)
- Terima donasi via Mayar
- Dashboard untuk gestion Masjid dan program

## Environment Variables

```env
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
SUMOPOD_API_KEY
SUMOPOD_BASE_URL
MAYAR_API_KEY
```

Lihat `.env.example` untuk detail.
