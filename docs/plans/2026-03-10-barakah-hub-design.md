# BarakahHub — Design Document

## Overview

Web app untuk membantu pengurus masjid/komunitas kecil membuat halaman program Ramadhan + donasi secara instan dengan bantuan AI, terhubung ke pembayaran online Mayar.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js v5 (credentials provider) |
| Database | SQLite local (dev) / Turso hosted (prod) + Drizzle ORM |
| AI | GPT-4o-mini via Sumopod (OpenAI-compatible API) |
| Payment | Mayar — manual URL (default) + API helper (bonus) |
| Deploy | Localhost first → Vercel later |

## Database Schema

### mosques
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | cuid |
| name | text | required |
| slug | text | unique, auto-generated |
| address | text | |
| city | text | |
| contact_whatsapp | text | |
| description | text | nullable |
| user_id | text FK | → users |
| created_at | integer | timestamp |
| updated_at | integer | timestamp |

### programs
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | cuid |
| mosque_id | text FK | → mosques |
| title | text | required |
| slug | text | unique |
| category | text | buka_puasa, santunan, kajian, renovasi, lainnya |
| event_date | text | nullable |
| target_amount | integer | nullable, dalam rupiah |
| notes | text | niat/tujuan singkat |
| mayar_campaign_url | text | nullable |
| ai_description | text | nullable, 3-5 paragraf |
| ai_whatsapp_text | text | nullable, 2-4 paragraf + bullets |
| ai_instagram_caption | text | nullable, <=150 kata + hashtags |
| created_at | integer | timestamp |
| updated_at | integer | timestamp |

### users (NextAuth managed)
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text | |
| email | text | unique |
| password | text | hashed (bcrypt) |
| emailVerified | integer | nullable |
| image | text | nullable |

NextAuth auto-generates: sessions, accounts, verification_tokens tables.

## Pages & Routes

### App Pages
| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page, hero + CTA |
| `/login` | Public | Login |
| `/register` | Public | Register akun pengurus |
| `/dashboard` | Protected | "Masjid Saya" — list program + actions |
| `/dashboard/mosque/setup` | Protected | Form daftar/edit masjid |
| `/dashboard/programs/new` | Protected | Form buat program + AI generate |
| `/dashboard/programs/[id]` | Protected | Edit program + paste link Mayar |
| `/m/[slug]` | Public | Halaman publik masjid (list program) |
| `/m/[slug]/[programSlug]` | Public | Detail program + tombol Donasi |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth handlers |
| `/api/programs/[id]/generate` | POST | AI generate konten |
| `/api/mayar/create-campaign` | POST | (Bonus) Create kampanye Mayar via API |

## AI Content Generation

### Flow
1. User klik "Generate Konten AI" di form program
2. Backend ambil data masjid + program dari DB
3. Kirim ke Sumopod (OpenAI-compatible, model: gpt-4o-mini)
4. System prompt: konteks Ramadhan, tone Islami, bahasa Indonesia
5. Response format: structured JSON
6. Parse → 3 output: ai_description, ai_whatsapp_text, ai_instagram_caption
7. Simpan ke DB, tampilkan di editable textarea

### Technical Details
- Pakai `openai` SDK, ganti `baseURL` ke Sumopod endpoint
- `response_format: { type: "json_object" }`
- Rate limit: 1 generate per program per 30 detik
- Hasil di-cache di DB, tidak re-generate tiap page load

## Mayar Integration

### Mode 1: Manual (Default)
- Pengurus buat kampanye di dashboard Mayar
- Copy-paste URL ke field "Link Donasi Mayar" di form program
- Validasi: URL harus mengandung "mayar"
- Tampil sebagai tombol "Donasi Sekarang" (target="_blank")

### Mode 2: API Helper (Bonus)
- Muncul jika `MAYAR_API_KEY` di-set di env
- POST /api/mayar/create-campaign → kirim judul, deskripsi AI, target dana
- Response: campaign URL → auto-fill field mayar_campaign_url

## UI Components

| Component | Description |
|-----------|-------------|
| LandingHero | Hero section + CTA |
| AuthForm | Login/register form |
| MosqueForm | Form daftar/edit masjid |
| ProgramForm | Form buat/edit program |
| AIGenerateButton | Tombol trigger AI + loading state |
| ContentPreview | 3 textarea editable (deskripsi, WA, IG) |
| ProgramCard | Card program di dashboard & halaman publik |
| CopyButton | Copy teks WA/IG ke clipboard |
| DonateButton | "Donasi Sekarang" → link Mayar |
| PublicLayout | Layout halaman publik |

### Design Direction
- Mobile-first responsive
- Warna: hijau/emerald (nuansa Islami) + white + slate
- shadcn/ui untuk konsistensi komponen

## Core Features (Lean MVP)

1. Register/login pengurus
2. Daftarkan masjid (form singkat, auto-slug)
3. Buat program Ramadhan + AI generate 3 konten
4. Halaman publik masjid & program + tombol Donasi Sekarang
5. Halaman "Masjid Saya" — list program, copy teks WA/IG

## Deliberately Cut
- Status draft/published (semua langsung tampil)
- Profil masjid elaborate
- Dashboard complex
- Multi-role auth
- Laporan keuangan
- Mobile native app
