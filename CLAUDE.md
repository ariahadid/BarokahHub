# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BarakahHub is an Indonesian-language platform helping small mosques create Ramadhan program pages with AI-generated content and accept donations. Built for the VIBECODING 2026 hackathon.

## Commands

- `npm run dev` — Start development server (Next.js)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npx drizzle-kit push` — Push schema changes to database
- `npx drizzle-kit generate` — Generate migration files

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn/ui v4

**Database:** SQLite via Turso (`@libsql/client`) + Drizzle ORM. Local dev uses `file:local.db`. Schema in `src/lib/db/schema.ts`, client in `src/lib/db/index.ts`.

**Auth:** NextAuth v5 with credentials provider (email/password), JWT strategy, Drizzle adapter. Config in `src/lib/auth.ts`. Session includes `user.id` via JWT callback.

### Key Patterns

- **Server Actions** (`src/lib/actions/`) handle mutations (auth, mosque CRUD, program CRUD) with `"use server"` directive
- **API Routes** (`src/app/api/`) for client-side calls: AI generation, Mayar payment, NextAuth
- **Route Groups:** `(auth)` for login/register, `(dashboard)` for protected pages
- **Dynamic Routes:** `/m/[slug]` for public mosque pages, `/m/[slug]/[programSlug]` for program pages
- **Protection:** Dashboard layout checks session and redirects to `/login`
- **Import alias:** `@/` maps to `src/`

### External Integrations

- **AI (Sumopod):** `src/lib/ai.ts` — calls `SUMOPOD_BASE_URL` with GPT-4o-mini to generate program descriptions, WhatsApp text, and Instagram captions in Indonesian
- **Payments (Mayar):** `src/lib/mayar.ts` — creates donation campaigns via Mayar API, stores campaign URL on program

### Database Schema (4 tables)

- `users` — auth accounts with hashed passwords
- `sessions` — NextAuth sessions
- `mosques` — belongs to user, has unique slug
- `programs` — belongs to mosque, stores AI-generated content fields and Mayar campaign URL

IDs use CUID2. Foreign keys cascade on delete.

## Conventions

- Files: kebab-case. Components: PascalCase. DB columns: snake_case.
- UI uses emerald color scheme with Shadcn/ui components
- All user-facing text is in Bahasa Indonesia
- Slug utility in `src/lib/utils/slug.ts` for URL-safe strings
- `cn()` helper in `src/lib/utils/utils.ts` (clsx + tailwind-merge)

## Environment Variables

See `.env.example`: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUMOPOD_API_KEY`, `SUMOPOD_BASE_URL`, `MAYAR_API_KEY`
