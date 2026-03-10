# BarakahHub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app that helps mosque administrators create Ramadhan program pages with AI-generated content and Mayar donation links.

**Architecture:** Next.js App Router monolith with Server Actions for mutations, Route Handlers for AI generation and Mayar API. SQLite (local dev) / Turso (prod) via Drizzle ORM. NextAuth v5 for credentials-based auth.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, NextAuth v5, Drizzle ORM, libSQL/Turso, OpenAI SDK (Sumopod), bcrypt.

---

## Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.local`, `.env.example`, `.gitignore`

**Step 1: Initialize Next.js project**

```bash
cd C:/Users/mypc/Documents/Project/BarakahHUb
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the full Next.js scaffold.

**Step 2: Install core dependencies**

```bash
npm install drizzle-orm @libsql/client @auth/core @auth/drizzle-adapter next-auth@beta bcryptjs openai @cuid/cuid2
npm install -D drizzle-kit @types/bcryptjs
```

**Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select defaults: New York style, Slate base color, CSS variables.

Then add needed components:

```bash
npx shadcn@latest add button card input label textarea select badge separator toast
```

**Step 4: Create .env.example and .env.local**

`.env.example`:
```
DATABASE_URL=file:local.db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
SUMOPOD_API_KEY=your-sumopod-api-key
SUMOPOD_BASE_URL=https://api.sumopod.com/v1
MAYAR_API_KEY=
```

Copy to `.env.local` with real values (or placeholders for now).

**Step 5: Verify dev server runs**

```bash
npm run dev
```

Expected: Next.js dev server at http://localhost:3000, default page renders.

**Step 6: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

## Task 2: Database Schema & Drizzle Setup

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`

**Step 1: Create Drizzle config**

`drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:local.db",
  },
});
```

**Step 2: Create database schema**

`src/lib/db/schema.ts`:
```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@cuid/cuid2";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const mosques = sqliteTable("mosques", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  city: text("city"),
  contactWhatsapp: text("contact_whatsapp"),
  description: text("description"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mosqueId: text("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // buka_puasa | santunan | kajian | renovasi | lainnya
  eventDate: text("event_date"),
  targetAmount: integer("target_amount"),
  notes: text("notes"),
  mayarCampaignUrl: text("mayar_campaign_url"),
  aiDescription: text("ai_description"),
  aiWhatsappText: text("ai_whatsapp_text"),
  aiInstagramCaption: text("ai_instagram_caption"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```

**Step 3: Create database client**

`src/lib/db/index.ts`:
```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

**Step 4: Generate and run migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

Expected: Tables created in local.db.

**Step 5: Verify with Drizzle Studio**

```bash
npx drizzle-kit studio
```

Expected: Opens browser showing tables: users, sessions, mosques, programs.

**Step 6: Commit**

```bash
git add src/lib/db/ drizzle.config.ts drizzle/
git commit -m "feat: add database schema with Drizzle ORM"
```

---

## Task 3: Authentication (NextAuth v5)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/lib/actions/auth.ts`

**Step 1: Configure NextAuth**

`src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  session: { strategy: "jwt" },
});
```

**Step 2: Create auth API route**

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

**Step 3: Create register server action**

`src/lib/actions/auth.ts`:
```typescript
"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Semua field wajib diisi" };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  redirect("/login?registered=true");
}
```

**Step 4: Create auth layout**

`src/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}
```

**Step 5: Create login page**

`src/app/(auth)/login/page.tsx`:
```tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk ke BarakahHub</CardTitle>
        <CardDescription>Login untuk mengelola masjid dan program Ramadhan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="text-emerald-600 hover:underline">Daftar</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 6: Create register page**

`src/app/(auth)/register/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Akun</CardTitle>
        <CardDescription>Buat akun untuk mendaftarkan masjid Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">Masuk</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 7: Test auth flow manually**

```bash
npm run dev
```

1. Go to http://localhost:3000/register → fill form → should redirect to /login
2. Go to http://localhost:3000/login → login → should redirect to /dashboard (will 404, that's ok)

**Step 8: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/app/\(auth\)/ src/lib/actions/auth.ts
git commit -m "feat: add authentication with NextAuth v5 credentials"
```

---

## Task 4: Dashboard Layout & Mosque Setup

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/dashboard/mosque/setup/page.tsx`
- Create: `src/lib/actions/mosque.ts`
- Create: `src/lib/utils/slug.ts`

**Step 1: Create slug utility**

`src/lib/utils/slug.ts`:
```typescript
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
```

**Step 2: Create mosque server actions**

`src/lib/actions/mosque.ts`:
```typescript
"use server";

import { db } from "@/lib/db";
import { mosques } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createOrUpdateMosque(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const contactWhatsapp = formData.get("contactWhatsapp") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Nama masjid wajib diisi" };

  const existing = await db.query.mosques.findFirst({
    where: eq(mosques.userId, session.user.id),
  });

  const slug = generateSlug(name);

  if (existing) {
    await db.update(mosques)
      .set({ name, slug, address, city, contactWhatsapp, description, updatedAt: new Date() })
      .where(eq(mosques.id, existing.id));
  } else {
    await db.insert(mosques).values({
      name, slug, address, city, contactWhatsapp, description,
      userId: session.user.id,
    });
  }

  redirect("/dashboard");
}

export async function getMosqueByUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.query.mosques.findFirst({
    where: eq(mosques.userId, session.user.id),
  });
}
```

**Step 3: Create dashboard layout with navbar**

`src/app/(dashboard)/layout.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-emerald-700 text-lg">
            BarakahHub
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user?.name}</span>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <Button variant="ghost" size="sm" type="submit">Keluar</Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 4: Create dashboard page**

`src/app/(dashboard)/dashboard/page.tsx`:
```tsx
import { getMosqueByUser } from "@/lib/actions/mosque";
import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const mosque = await getMosqueByUser();

  if (!mosque) redirect("/dashboard/mosque/setup");

  const mosquePrograms = await db.query.programs.findMany({
    where: eq(programs.mosqueId, mosque.id),
    orderBy: (programs, { desc }) => [desc(programs.createdAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{mosque.name}</h1>
          <p className="text-muted-foreground">{mosque.city}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/mosque/setup">
            <Button variant="outline" size="sm">Edit Masjid</Button>
          </Link>
          <Link href="/dashboard/programs/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              + Program Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Halaman publik:</span>
        <Link href={`/m/${mosque.slug}`} className="text-sm text-emerald-600 hover:underline">
          /m/{mosque.slug}
        </Link>
      </div>

      {mosquePrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada program. Klik "+ Program Baru" untuk memulai.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mosquePrograms.map((program) => (
            <Card key={program.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{program.title}</CardTitle>
                  <Badge variant="secondary">{program.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {program.eventDate && <span>{program.eventDate}</span>}
                    {program.targetAmount && <span> &middot; Target: Rp {program.targetAmount.toLocaleString("id-ID")}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/programs/${program.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Link href={`/m/${mosque.slug}/${program.slug}`}>
                      <Button variant="ghost" size="sm">Lihat</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 5: Create mosque setup page**

`src/app/(dashboard)/dashboard/mosque/setup/page.tsx`:
```tsx
import { getMosqueByUser } from "@/lib/actions/mosque";
import { createOrUpdateMosque } from "@/lib/actions/mosque";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function MosqueSetupPage() {
  const mosque = await getMosqueByUser();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mosque ? "Edit Masjid" : "Daftarkan Masjid"}</CardTitle>
        <CardDescription>
          {mosque ? "Perbarui informasi masjid Anda" : "Isi informasi dasar masjid Anda untuk memulai"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createOrUpdateMosque} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Masjid *</Label>
            <Input id="name" name="name" required defaultValue={mosque?.name || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" defaultValue={mosque?.address || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input id="city" name="city" defaultValue={mosque?.city || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactWhatsapp">Nomor WhatsApp</Label>
            <Input id="contactWhatsapp" name="contactWhatsapp" defaultValue={mosque?.contactWhatsapp || ""} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Singkat (opsional)</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={mosque?.description || ""} />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            {mosque ? "Simpan Perubahan" : "Daftarkan Masjid"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 6: Test manually**

1. Login → should redirect to /dashboard → should redirect to /dashboard/mosque/setup
2. Fill mosque form → submit → should redirect to /dashboard showing mosque name
3. Click "Edit Masjid" → form should be pre-filled

**Step 7: Commit**

```bash
git add src/app/\(dashboard\)/ src/lib/actions/mosque.ts src/lib/utils/slug.ts
git commit -m "feat: add dashboard layout and mosque management"
```

---

## Task 5: Program CRUD

**Files:**
- Create: `src/app/(dashboard)/dashboard/programs/new/page.tsx`
- Create: `src/app/(dashboard)/dashboard/programs/[id]/page.tsx`
- Create: `src/lib/actions/program.ts`
- Create: `src/components/program-form.tsx`

**Step 1: Create program server actions**

`src/lib/actions/program.ts`:
```typescript
"use server";

import { db } from "@/lib/db";
import { programs, mosques } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/slug";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createProgram(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.userId, session.user.id),
  });
  if (!mosque) return { error: "Daftarkan masjid terlebih dahulu" };

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const eventDate = formData.get("eventDate") as string;
  const targetAmount = formData.get("targetAmount") as string;
  const notes = formData.get("notes") as string;

  if (!title || !category) return { error: "Judul dan kategori wajib diisi" };

  const slug = generateSlug(title);

  await db.insert(programs).values({
    mosqueId: mosque.id,
    title,
    slug,
    category,
    eventDate: eventDate || null,
    targetAmount: targetAmount ? parseInt(targetAmount) : null,
    notes: notes || null,
  });

  redirect("/dashboard");
}

export async function updateProgram(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const eventDate = formData.get("eventDate") as string;
  const targetAmount = formData.get("targetAmount") as string;
  const notes = formData.get("notes") as string;
  const mayarCampaignUrl = formData.get("mayarCampaignUrl") as string;
  const aiDescription = formData.get("aiDescription") as string;
  const aiWhatsappText = formData.get("aiWhatsappText") as string;
  const aiInstagramCaption = formData.get("aiInstagramCaption") as string;

  await db.update(programs)
    .set({
      title,
      slug: generateSlug(title),
      category,
      eventDate: eventDate || null,
      targetAmount: targetAmount ? parseInt(targetAmount) : null,
      notes: notes || null,
      mayarCampaignUrl: mayarCampaignUrl || null,
      aiDescription: aiDescription || null,
      aiWhatsappText: aiWhatsappText || null,
      aiInstagramCaption: aiInstagramCaption || null,
      updatedAt: new Date(),
    })
    .where(eq(programs.id, id));

  redirect("/dashboard");
}

export async function getProgram(id: string) {
  return db.query.programs.findFirst({
    where: eq(programs.id, id),
  });
}
```

**Step 2: Create ProgramForm component**

`src/components/program-form.tsx`:
```tsx
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
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

export function ProgramForm({ program, action }: ProgramFormProps) {
  const [aiDescription, setAiDescription] = useState(program?.aiDescription || "");
  const [aiWhatsappText, setAiWhatsappText] = useState(program?.aiWhatsappText || "");
  const [aiInstagramCaption, setAiInstagramCaption] = useState(program?.aiInstagramCaption || "");
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
      const res = await fetch(`/api/programs/${program.id}/generate`, { method: "POST" });
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
        <CardHeader><CardTitle>Detail Program</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Program *</Label>
            <Input id="title" name="title" required defaultValue={program?.title || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <select id="category" name="category" required defaultValue={program?.category || ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal</Label>
              <Input id="eventDate" name="eventDate" type="date" defaultValue={program?.eventDate || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Dana (Rp)</Label>
              <Input id="targetAmount" name="targetAmount" type="number" defaultValue={program?.targetAmount || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Niat / Tujuan Program</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={program?.notes || ""}
              placeholder="Jelaskan singkat tujuan program ini..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Konten AI</CardTitle>
            <Button type="button" onClick={handleGenerate} disabled={generating}
              variant="outline" className="text-emerald-600 border-emerald-600">
              {generating ? "Generating..." : "Generate Konten AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiDescription">Deskripsi Program</Label>
            </div>
            <Textarea id="aiDescription" name="aiDescription" rows={6}
              value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiWhatsappText">Teks Broadcast WhatsApp</Label>
              {aiWhatsappText && (
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => copyToClipboard(aiWhatsappText)}>Copy</Button>
              )}
            </div>
            <Textarea id="aiWhatsappText" name="aiWhatsappText" rows={6}
              value={aiWhatsappText} onChange={(e) => setAiWhatsappText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiInstagramCaption">Caption Instagram</Label>
              {aiInstagramCaption && (
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => copyToClipboard(aiInstagramCaption)}>Copy</Button>
              )}
            </div>
            <Textarea id="aiInstagramCaption" name="aiInstagramCaption" rows={4}
              value={aiInstagramCaption} onChange={(e) => setAiInstagramCaption(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Link Donasi Mayar</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="mayarCampaignUrl">URL Kampanye Mayar</Label>
          <Input id="mayarCampaignUrl" name="mayarCampaignUrl"
            defaultValue={program?.mayarCampaignUrl || ""}
            placeholder="https://masjid.mayar.id/program-anda" />
          <p className="text-xs text-muted-foreground">
            Buat kampanye donasi di dashboard Mayar, lalu paste link-nya di sini.
          </p>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
        {program ? "Simpan Perubahan" : "Simpan Program"}
      </Button>
    </form>
  );
}
```

**Step 3: Create new program page**

`src/app/(dashboard)/dashboard/programs/new/page.tsx`:
```tsx
import { createProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";

export default function NewProgramPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Program Ramadhan</h1>
      <ProgramForm action={createProgram} />
    </div>
  );
}
```

**Step 4: Create edit program page**

`src/app/(dashboard)/dashboard/programs/[id]/page.tsx`:
```tsx
import { getProgram, updateProgram } from "@/lib/actions/program";
import { ProgramForm } from "@/components/program-form";
import { notFound } from "next/navigation";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = await getProgram(id);
  if (!program) notFound();

  const action = updateProgram.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Program</h1>
      <ProgramForm program={program} action={action} />
    </div>
  );
}
```

**Step 5: Test manually**

1. Dashboard → "+ Program Baru" → fill form → submit → appears on dashboard
2. Click "Edit" → form pre-filled → change title → save → updated

**Step 6: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/programs/ src/lib/actions/program.ts src/components/program-form.tsx
git commit -m "feat: add program CRUD with form and AI content fields"
```

---

## Task 6: AI Content Generation API

**Files:**
- Create: `src/app/api/programs/[id]/generate/route.ts`
- Create: `src/lib/ai.ts`

**Step 1: Create AI helper**

`src/lib/ai.ts`:
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.SUMOPOD_API_KEY,
  baseURL: process.env.SUMOPOD_BASE_URL,
});

interface GenerateInput {
  mosqueName: string;
  mosqueCity: string | null;
  mosqueDescription: string | null;
  programTitle: string;
  programCategory: string;
  programEventDate: string | null;
  programTargetAmount: number | null;
  programNotes: string | null;
}

interface GenerateOutput {
  ai_description: string;
  ai_whatsapp_text: string;
  ai_instagram_caption: string;
}

export async function generateProgramContent(input: GenerateInput): Promise<GenerateOutput> {
  const categoryLabels: Record<string, string> = {
    buka_puasa: "Buka Puasa Bersama",
    santunan: "Santunan",
    kajian: "Kajian Islami",
    renovasi: "Renovasi Masjid",
    lainnya: "Program Masjid",
  };

  const categoryLabel = categoryLabels[input.programCategory] || input.programCategory;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Kamu adalah asisten konten untuk masjid di Indonesia. Tugasmu membuat konten promosi program Ramadhan yang persuasif, hangat, dan bernuansa Islami. Gunakan bahasa Indonesia yang baik, sertakan ayat/hadits yang relevan jika sesuai. Jangan mengada-ada informasi yang tidak diberikan.

Balas dalam format JSON dengan 3 field:
- "ai_description": Deskripsi program 3-5 paragraf untuk halaman web. Informatif dan menarik.
- "ai_whatsapp_text": Teks broadcast WhatsApp 2-4 paragraf dengan bullet point ajakan donasi. Gunakan emoji secukupnya. Sertakan salam pembuka dan penutup.
- "ai_instagram_caption": Caption Instagram maksimal 150 kata dengan 3-5 hashtag relevan di akhir.`,
      },
      {
        role: "user",
        content: `Buatkan konten untuk program Ramadhan berikut:

Masjid: ${input.mosqueName}
Kota: ${input.mosqueCity || "tidak disebutkan"}
Tentang masjid: ${input.mosqueDescription || "tidak ada deskripsi"}

Program: ${input.programTitle}
Kategori: ${categoryLabel}
Tanggal: ${input.programEventDate || "belum ditentukan"}
Target dana: ${input.programTargetAmount ? `Rp ${input.programTargetAmount.toLocaleString("id-ID")}` : "tidak ditentukan"}
Tujuan/niat: ${input.programNotes || "tidak disebutkan"}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");

  return JSON.parse(content) as GenerateOutput;
}
```

**Step 2: Create API route**

`src/app/api/programs/[id]/generate/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { programs, mosques } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateProgramContent } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const program = await db.query.programs.findFirst({
    where: eq(programs.id, id),
  });
  if (!program) {
    return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
  }

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.id, program.mosqueId),
  });
  if (!mosque || mosque.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const content = await generateProgramContent({
      mosqueName: mosque.name,
      mosqueCity: mosque.city,
      mosqueDescription: mosque.description,
      programTitle: program.title,
      programCategory: program.category,
      programEventDate: program.eventDate,
      programTargetAmount: program.targetAmount,
      programNotes: program.notes,
    });

    await db.update(programs)
      .set({
        aiDescription: content.ai_description,
        aiWhatsappText: content.ai_whatsapp_text,
        aiInstagramCaption: content.ai_instagram_caption,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id));

    return NextResponse.json(content);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Gagal generate konten. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
```

**Step 3: Test manually**

1. Create a program → go to edit page → click "Generate Konten AI"
2. Should populate 3 textarea fields with AI-generated content
3. Edit content → save → should persist

**Step 4: Commit**

```bash
git add src/lib/ai.ts src/app/api/programs/
git commit -m "feat: add AI content generation via Sumopod API"
```

---

## Task 7: Public Pages (Mosque & Program)

**Files:**
- Create: `src/app/m/[slug]/page.tsx`
- Create: `src/app/m/[slug]/[programSlug]/page.tsx`
- Create: `src/app/m/layout.tsx`

**Step 1: Create public layout**

`src/app/m/layout.tsx`:
```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <span className="font-bold text-emerald-700 text-lg">BarakahHub</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 2: Create public mosque page**

`src/app/m/[slug]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { mosques, programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PublicMosquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.slug, slug),
  });
  if (!mosque) notFound();

  const mosquePrograms = await db.query.programs.findMany({
    where: eq(programs.mosqueId, mosque.id),
    orderBy: (programs, { desc }) => [desc(programs.createdAt)],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-800">{mosque.name}</h1>
        {mosque.city && <p className="text-muted-foreground mt-1">{mosque.address ? `${mosque.address}, ` : ""}{mosque.city}</p>}
        {mosque.description && <p className="mt-3 text-slate-700">{mosque.description}</p>}
        {mosque.contactWhatsapp && (
          <a href={`https://wa.me/${mosque.contactWhatsapp.replace(/^0/, "62")}`}
            className="inline-block mt-3 text-sm text-emerald-600 hover:underline"
            target="_blank" rel="noopener">
            Chat WhatsApp
          </a>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Program Ramadhan</h2>

      {mosquePrograms.length === 0 ? (
        <p className="text-muted-foreground">Belum ada program.</p>
      ) : (
        <div className="grid gap-4">
          {mosquePrograms.map((program) => (
            <Link key={program.id} href={`/m/${slug}/${program.slug}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <Badge variant="secondary">{program.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {program.aiDescription || program.notes || ""}
                  </p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {program.eventDate && <span>{program.eventDate}</span>}
                    {program.targetAmount && <span> &middot; Target: Rp {program.targetAmount.toLocaleString("id-ID")}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create public program detail page**

`src/app/m/[slug]/[programSlug]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { mosques, programs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default async function PublicProgramPage({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
}) {
  const { slug, programSlug } = await params;

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.slug, slug),
  });
  if (!mosque) notFound();

  const program = await db.query.programs.findFirst({
    where: and(
      eq(programs.mosqueId, mosque.id),
      eq(programs.slug, programSlug)
    ),
  });
  if (!program) notFound();

  return (
    <div>
      <Link href={`/m/${slug}`} className="text-sm text-emerald-600 hover:underline mb-4 inline-block">
        &larr; Kembali ke {mosque.name}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-emerald-800">{program.title}</h1>
          <Badge variant="secondary">{program.category}</Badge>
        </div>
        <p className="text-muted-foreground">{mosque.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {program.eventDate && (
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">Tanggal</p>
            <p className="font-medium">{program.eventDate}</p>
          </div>
        )}
        {program.targetAmount && (
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">Target Dana</p>
            <p className="font-medium">Rp {program.targetAmount.toLocaleString("id-ID")}</p>
          </div>
        )}
      </div>

      {program.aiDescription && (
        <div className="prose prose-slate max-w-none mb-8">
          {program.aiDescription.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {program.mayarCampaignUrl && (
        <>
          <Separator className="my-8" />
          <div className="text-center">
            <a href={program.mayarCampaignUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
                Donasi Sekarang
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Anda akan diarahkan ke halaman pembayaran Mayar
            </p>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 4: Test manually**

1. Visit http://localhost:3000/m/[mosque-slug] → should show mosque info + program list
2. Click a program → should show detail + "Donasi Sekarang" button (if Mayar URL set)
3. Click "Donasi Sekarang" → should open Mayar URL in new tab

**Step 5: Commit**

```bash
git add src/app/m/
git commit -m "feat: add public mosque and program pages with donate button"
```

---

## Task 8: Landing Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Update root layout**

Update `src/app/layout.tsx` to set metadata and font:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BarakahHub — Program Ramadhan & Donasi Online untuk Masjid",
  description: "Buat halaman program Ramadhan dan donasi online untuk masjid Anda dengan bantuan AI, terhubung ke Mayar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 2: Create landing page**

`src/app/page.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-emerald-700 text-lg">BarakahHub</span>
        <Link href="/login">
          <Button variant="ghost" size="sm">Masuk</Button>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Program Ramadhan & Donasi Online
          <br />
          <span className="text-emerald-600">untuk Masjid Anda</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          Buat halaman program Ramadhan dengan bantuan AI dalam hitungan menit.
          Hubungkan ke donasi online Mayar. Tanpa tim IT.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
            Daftarkan Masjid Anda
          </Button>
        </Link>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl mb-3">1</div>
            <h3 className="font-semibold mb-2">Daftarkan Masjid</h3>
            <p className="text-sm text-slate-600">Isi nama, alamat, dan kontak masjid. Cukup 2 menit.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl mb-3">2</div>
            <h3 className="font-semibold mb-2">Buat Program + AI</h3>
            <p className="text-sm text-slate-600">Buat program Ramadhan dan generate konten promosi otomatis dengan AI.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl mb-3">3</div>
            <h3 className="font-semibold mb-2">Terima Donasi</h3>
            <p className="text-sm text-slate-600">Hubungkan ke Mayar dan bagikan link ke jamaah via WhatsApp & Instagram.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 3: Test manually**

Visit http://localhost:3000 → landing page with hero, 3-step explanation, CTA button.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add landing page with hero and CTA"
```

---

## Task 9: Mayar API Helper (Bonus)

**Files:**
- Create: `src/app/api/mayar/create-campaign/route.ts`
- Create: `src/lib/mayar.ts`

**Step 1: Create Mayar helper**

`src/lib/mayar.ts`:
```typescript
interface CreateCampaignInput {
  name: string;
  description: string;
  targetAmount?: number;
}

interface CreateCampaignResult {
  campaignUrl: string;
}

export async function createMayarCampaign(input: CreateCampaignInput): Promise<CreateCampaignResult> {
  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) throw new Error("MAYAR_API_KEY not configured");

  const response = await fetch("https://api.mayar.id/hl/v1/payment/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      amount: input.targetAmount || 0,
      type: "donation",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Mayar API error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return { campaignUrl: data.data?.link || data.data?.url || "" };
}
```

**Step 2: Create API route**

`src/app/api/mayar/create-campaign/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMayarCampaign } from "@/lib/mayar";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MAYAR_API_KEY) {
    return NextResponse.json({ error: "Mayar API belum dikonfigurasi" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, description, targetAmount } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama program wajib diisi" }, { status: 400 });
    }

    const result = await createMayarCampaign({ name, description, targetAmount });

    return NextResponse.json({ campaignUrl: result.campaignUrl });
  } catch (error) {
    console.error("Mayar API error:", error);
    return NextResponse.json(
      { error: "Gagal membuat kampanye Mayar" },
      { status: 500 }
    );
  }
}
```

**Step 3: Test manually**

Only works if `MAYAR_API_KEY` is set. Otherwise, the button should be hidden or show "belum dikonfigurasi".

**Step 4: Commit**

```bash
git add src/lib/mayar.ts src/app/api/mayar/
git commit -m "feat: add Mayar API helper for campaign creation (bonus)"
```

---

## Task 10: Final Polish & Testing

**Step 1: Add NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:
```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

**Step 2: Full manual test checklist**

Run `npm run dev` and test:

1. [ ] Landing page loads at /
2. [ ] Register new account at /register
3. [ ] Login at /login → redirects to /dashboard
4. [ ] Redirect to /dashboard/mosque/setup (no mosque yet)
5. [ ] Fill mosque form → submit → redirects to /dashboard
6. [ ] Click "+ Program Baru" → fill form → submit → appears on dashboard
7. [ ] Click "Edit" on program → click "Generate Konten AI" → 3 fields populated
8. [ ] Edit AI content → save → changes persist
9. [ ] Add Mayar URL to program → save
10. [ ] Visit /m/[slug] → mosque page with program list
11. [ ] Click program → detail page with "Donasi Sekarang" button
12. [ ] Click "Donasi Sekarang" → opens Mayar URL in new tab
13. [ ] Test on mobile viewport → responsive

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: add type augmentation and final polish"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Project scaffolding & deps | None |
| 2 | Database schema & Drizzle | Task 1 |
| 3 | Authentication (NextAuth) | Task 2 |
| 4 | Dashboard & mosque setup | Task 3 |
| 5 | Program CRUD | Task 4 |
| 6 | AI content generation | Task 5 |
| 7 | Public pages | Task 5 |
| 8 | Landing page | Task 1 |
| 9 | Mayar API helper (bonus) | Task 5 |
| 10 | Final polish & testing | All |
