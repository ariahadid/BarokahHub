# Mayar Webhook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Receive real-time payment notifications from Mayar via webhook and automatically update program donation amounts.

**Architecture:** Add a `mayarPaymentId` column to the programs table to link Mayar payments to programs. Update the create-campaign flow to save this ID. Create a webhook endpoint that verifies signatures, matches payments to programs, and increments `collectedAmount`.

**Tech Stack:** Next.js App Router API routes, Drizzle ORM, Node.js `crypto` for HMAC-SHA256 signature verification.

---

### Task 1: Add mayarPaymentId Column to Schema

**Files:**
- Modify: `src/lib/db/schema.ts:33-49`

**Step 1: Add the column**

In `src/lib/db/schema.ts`, add `mayarPaymentId` to the `programs` table, after the `mayarCampaignUrl` line (line 43):

```tsx
  mayarPaymentId: text("mayar_payment_id"),
```

So lines 42-44 become:
```tsx
  mayarCampaignUrl: text("mayar_campaign_url"),
  mayarPaymentId: text("mayar_payment_id"),
  aiDescription: text("ai_description"),
```

**Step 2: Push schema to database**

Run: `npx drizzle-kit push`
Expected: Schema updated, new column added.

**Step 3: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add mayarPaymentId column to programs table"
```

---

### Task 2: Update Mayar Lib and Create-Campaign Route

**Files:**
- Modify: `src/lib/mayar.ts:10-12,43-44`
- Modify: `src/app/api/mayar/create-campaign/route.ts:20,45`

**Step 1: Update CreateCampaignResult to include paymentId**

In `src/lib/mayar.ts`, change `CreateCampaignResult` (lines 10-12) from:

```tsx
interface CreateCampaignResult {
  campaignUrl: string;
}
```

to:

```tsx
interface CreateCampaignResult {
  campaignUrl: string;
  paymentId: string;
}
```

**Step 2: Return paymentId from createMayarCampaign**

In `src/lib/mayar.ts`, change the return statement (line 44) from:

```tsx
  return { campaignUrl: data.data?.link || data.data?.url || "" };
```

to:

```tsx
  return {
    campaignUrl: data.data?.link || data.data?.url || "",
    paymentId: data.data?.id || "",
  };
```

**Step 3: Update create-campaign route to return paymentId**

In `src/app/api/mayar/create-campaign/route.ts`, change line 45 from:

```tsx
    return NextResponse.json({ campaignUrl: result.campaignUrl });
```

to:

```tsx
    return NextResponse.json({ campaignUrl: result.campaignUrl, paymentId: result.paymentId });
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 5: Commit**

```bash
git add src/lib/mayar.ts src/app/api/mayar/create-campaign/route.ts
git commit -m "feat: return paymentId from Mayar campaign creation"
```

---

### Task 3: Save paymentId in ProgramForm

**Files:**
- Modify: `src/components/program-form.tsx`

The ProgramForm has a `handleCreateMayar` function (lines 83-114) that calls `/api/mayar/create-campaign` and stores the campaign URL. We need to also store the payment ID.

**Step 1: Add paymentId state**

Find the line (around line 51):
```tsx
  const [mayarUrl, setMayarUrl] = useState(program?.mayarCampaignUrl || "");
```

Add after it:
```tsx
  const [mayarPaymentId, setMayarPaymentId] = useState(program?.mayarPaymentId || "");
```

**Step 2: Save paymentId from API response**

In the `handleCreateMayar` function, find (around line 108):
```tsx
      setMayarUrl(data.campaignUrl);
```

Add after it:
```tsx
      if (data.paymentId) setMayarPaymentId(data.paymentId);
```

**Step 3: Add hidden input for paymentId**

Find the hidden input for mayarCampaignUrl (around line 300):
```tsx
              <input type="hidden" name="mayarCampaignUrl" value={mayarUrl} />
```

Add after it:
```tsx
              <input type="hidden" name="mayarPaymentId" value={mayarPaymentId} />
```

Also find the other hidden input for mayarCampaignUrl (around line 309):
```tsx
              <input type="hidden" name="mayarCampaignUrl" value="" />
```

Add after it:
```tsx
              <input type="hidden" name="mayarPaymentId" value="" />
```

**Step 4: Update ProgramFormProps to include mayarPaymentId**

In the `program` prop interface (around line 20-33), add after `mayarCampaignUrl`:
```tsx
    mayarPaymentId: string | null;
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: May have errors in files that pass `program` prop — fix in Task 4.

---

### Task 4: Update Server Action and Edit Page to Handle paymentId

**Files:**
- Modify: `src/lib/actions/program.ts`
- Modify: `src/app/(dashboard)/dashboard/programs/[id]/page.tsx`

**Step 1: Check what updateProgram does with formData**

Read `src/lib/actions/program.ts` and find the `updateProgram` function. Add `mayarPaymentId` to the fields it reads from formData and saves to the database.

Add to the formData extraction:
```tsx
  const mayarPaymentId = formData.get("mayarPaymentId") as string || null;
```

Add to the db update object:
```tsx
  mayarPaymentId,
```

**Step 2: Update the edit page to pass mayarPaymentId to ProgramForm**

Read `src/app/(dashboard)/dashboard/programs/[id]/page.tsx`. The `program` object fetched from DB should already include `mayarPaymentId` since Drizzle returns all columns. Verify the program prop passed to `ProgramForm` includes it.

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/components/program-form.tsx src/lib/actions/program.ts src/app/(dashboard)/dashboard/programs/[id]/page.tsx
git commit -m "feat: save Mayar payment ID through program form"
```

---

### Task 5: Create Webhook Endpoint

**Files:**
- Create: `src/app/api/mayar/webhook/route.ts`

**Step 1: Create the webhook route**

Create `src/app/api/mayar/webhook/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return digest === signature;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

  const rawBody = await request.text();

  // Verify signature if secret is configured
  if (webhookSecret) {
    const signature = request.headers.get("x-mayar-signature")
      || request.headers.get("x-signature")
      || "";
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error("Mayar webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);
    const event = body.event || body.type || "";
    const paymentData = body.data || {};

    // Only process successful payments
    const status = paymentData.status?.toLowerCase() || "";
    if (!["paid", "success", "completed"].includes(status)) {
      return NextResponse.json({ message: "Event ignored", event, status });
    }

    const paymentId = paymentData.id || "";
    const amount = Number(paymentData.amount) || 0;

    if (!paymentId || amount <= 0) {
      return NextResponse.json({ error: "Missing payment ID or amount" }, { status: 400 });
    }

    // Find program by Mayar payment ID
    const program = await db.query.programs.findFirst({
      where: eq(programs.mayarPaymentId, paymentId),
    });

    if (!program) {
      console.error(`Mayar webhook: no program found for payment ID ${paymentId}`);
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Increment collectedAmount
    await db
      .update(programs)
      .set({
        collectedAmount: sql`COALESCE(${programs.collectedAmount}, 0) + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, program.id));

    console.log(`Mayar webhook: updated program ${program.id} (+${amount})`);

    return NextResponse.json({ message: "OK", programId: program.id, amount });
  } catch (error) {
    console.error("Mayar webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/app/api/mayar/webhook/route.ts
git commit -m "feat: add Mayar webhook endpoint for real-time donations"
```

---

### Task 6: Update .env.example and Build Verification

**Files:**
- Modify: `.env.example`

**Step 1: Add MAYAR_WEBHOOK_SECRET to .env.example**

Add at the end of `.env.example`:
```
MAYAR_WEBHOOK_SECRET=
```

**Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Lint check**

Run: `npm run lint`
Expected: No errors.

**Step 4: Commit**

```bash
git add .env.example
git commit -m "docs: add MAYAR_WEBHOOK_SECRET to .env.example"
```
