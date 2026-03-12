import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.SUMOPOD_API_KEY,
    baseURL: process.env.SUMOPOD_BASE_URL,
  });
}

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

  const response = await getOpenAIClient().chat.completions.create({
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
