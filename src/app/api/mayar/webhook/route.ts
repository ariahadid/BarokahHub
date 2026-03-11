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
