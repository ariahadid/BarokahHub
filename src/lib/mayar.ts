interface CreateCampaignInput {
  name: string;
  email: string;
  mobile?: string;
  description: string;
  targetAmount?: number;
  redirectUrl: string;
}

interface CreateCampaignResult {
  campaignUrl: string;
  paymentId: string;
}

export async function createMayarCampaign(input: CreateCampaignInput): Promise<CreateCampaignResult> {
  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) throw new Error("MAYAR_API_KEY not configured");

  // Set expiry to 30 days from now
  const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch("https://api.mayar.id/hl/v1/payment/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      mobile: input.mobile || "08000000000",
      amount: input.targetAmount || 10000,
      description: input.description,
      redirectUrl: input.redirectUrl,
      expiredAt,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Mayar API error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return {
    campaignUrl: data.data?.link || data.data?.url || "",
    paymentId: data.data?.id || "",
  };
}
