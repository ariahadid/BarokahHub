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
