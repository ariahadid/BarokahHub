# Open Graph Meta Tags Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dynamic Open Graph meta tags and generated OG images to public mosque and program pages so they show rich previews when shared on WhatsApp, Twitter, and social media.

**Architecture:** Create a single `/api/og` route that generates 1200x630 images using Next.js `ImageResponse`. Add `generateMetadata()` exports to both public pages (`/m/[slug]` and `/m/[slug]/[programSlug]`) that reference the OG image endpoint and include title/description metadata.

**Tech Stack:** Next.js `next/og` (ImageResponse), Next.js App Router `generateMetadata`, Drizzle ORM for DB queries.

---

### Task 1: Create OG Image Generation Route

**Files:**
- Create: `src/app/api/og/route.tsx`

**Step 1: Create the OG image route**

Create `src/app/api/og/route.tsx` with this content:

```tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "BarakahHub";
  const subtitle = searchParams.get("subtitle") || "";
  const type = searchParams.get("type") || "mosque";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "20px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              fontSize: "40px",
            }}
          >
            {type === "program" ? "🤲" : "🕌"}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 30 ? "44px" : "56px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              maxWidth: "900px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: "28px",
                color: "rgba(255,255,255,0.85)",
                maxWidth: "800px",
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Badge */}
          <div
            style={{
              display: "flex",
              marginTop: "10px",
              padding: "8px 24px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              fontSize: "20px",
            }}
          >
            {type === "program" ? "Program Ramadhan" : "Masjid"}
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.7)",
            fontSize: "22px",
          }}
        >
          BarakahHub
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

**Step 2: Verify the OG image route works**

Run: `npm run dev`
Visit: `http://localhost:3000/api/og?title=Masjid%20Al-Ikhlas&subtitle=Jakarta&type=mosque`
Expected: A 1200x630 emerald gradient image with "Masjid Al-Ikhlas", "Jakarta", and "Masjid" badge.

Also test: `http://localhost:3000/api/og?title=Buka%20Puasa%20Bersama&subtitle=Masjid%20Al-Ikhlas&type=program`
Expected: Same style but with "Program Ramadhan" badge and prayer emoji.

**Step 3: Commit**

```bash
git add src/app/api/og/route.tsx
git commit -m "feat: add dynamic OG image generation endpoint"
```

---

### Task 2: Add generateMetadata to Mosque Page

**Files:**
- Modify: `src/app/m/[slug]/page.tsx`

**Step 1: Add generateMetadata export**

Add these imports and the `generateMetadata` function before the existing `PublicMosquePage` component in `src/app/m/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
```

Add this function before the `export default async function PublicMosquePage`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.slug, slug),
  });
  if (!mosque) return {};

  const title = `${mosque.name} — Program Ramadhan | BarakahHub`;
  const description = mosque.description || `Lihat program Ramadhan dan donasi online untuk ${mosque.name}`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(mosque.name)}&subtitle=${encodeURIComponent(mosque.city || "")}&type=mosque`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: mosque.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
```

**Step 2: Verify metadata renders**

Run: `npm run dev`
Visit: `http://localhost:3000/m/<any-existing-slug>` and view page source.
Expected: `<meta property="og:title"`, `<meta property="og:image"`, `<meta name="twitter:card"` tags present in HTML head.

**Step 3: Commit**

```bash
git add src/app/m/[slug]/page.tsx
git commit -m "feat: add OG meta tags to public mosque page"
```

---

### Task 3: Add generateMetadata to Program Page

**Files:**
- Modify: `src/app/m/[slug]/[programSlug]/page.tsx`

**Step 1: Add generateMetadata export**

Add this import:

```tsx
import type { Metadata } from "next";
```

Add this function before the `export default async function PublicProgramPage`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
}): Promise<Metadata> {
  const { slug, programSlug } = await params;

  const mosque = await db.query.mosques.findFirst({
    where: eq(mosques.slug, slug),
  });
  if (!mosque) return {};

  const program = await db.query.programs.findFirst({
    where: and(
      eq(programs.mosqueId, mosque.id),
      eq(programs.slug, programSlug)
    ),
  });
  if (!program) return {};

  const title = `${program.title} — ${mosque.name} | BarakahHub`;
  const rawDesc = program.aiDescription || program.notes || "";
  const description = rawDesc.length > 200 ? rawDesc.slice(0, 197) + "..." : rawDesc || `Program Ramadhan ${program.title} di ${mosque.name}`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(program.title)}&subtitle=${encodeURIComponent(mosque.name)}&type=program`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: program.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
```

**Step 2: Verify metadata renders**

Run: `npm run dev`
Visit: `http://localhost:3000/m/<slug>/<program-slug>` and view page source.
Expected: OG tags with program title, mosque name in subtitle, and OG image URL pointing to `/api/og?title=...&type=program`.

**Step 3: Commit**

```bash
git add src/app/m/[slug]/[programSlug]/page.tsx
git commit -m "feat: add OG meta tags to public program page"
```

---

### Task 4: Build Verification

**Step 1: Run production build to catch type errors**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 2: Final commit (if any fixes needed)**

Fix any build errors, then:

```bash
git add -A
git commit -m "fix: resolve build errors for OG meta tags"
```
