export interface ProgramTemplate {
  id: string;
  emoji: string;
  title: string;
  category: string;
  categoryLabel: string;
  targetAmount: number;
  notes: string;
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: "buka-puasa",
    emoji: "🍽️",
    title: "Buka Puasa Bersama",
    category: "buka_puasa",
    categoryLabel: "Buka Puasa",
    targetAmount: 5_000_000,
    notes: "Menyediakan takjil dan makanan berbuka untuk jamaah dan warga sekitar",
  },
  {
    id: "sahur-on-the-road",
    emoji: "🌙",
    title: "Sahur on the Road",
    category: "buka_puasa",
    categoryLabel: "Buka Puasa",
    targetAmount: 3_000_000,
    notes: "Membagikan paket sahur untuk pekerja malam dan warga kurang mampu",
  },
  {
    id: "santunan-yatim",
    emoji: "🤝",
    title: "Santunan Anak Yatim",
    category: "santunan",
    categoryLabel: "Santunan",
    targetAmount: 10_000_000,
    notes: "Memberikan santunan berupa uang dan perlengkapan sekolah untuk anak yatim",
  },
  {
    id: "kajian-ramadhan",
    emoji: "📖",
    title: "Kajian Ramadhan Rutin",
    category: "kajian",
    categoryLabel: "Kajian",
    targetAmount: 2_000_000,
    notes: "Mengadakan kajian rutin setiap malam Ramadhan bersama ustadz",
  },
  {
    id: "renovasi-masjid",
    emoji: "🏗️",
    title: "Renovasi Masjid Ramadhan",
    category: "renovasi",
    categoryLabel: "Renovasi",
    targetAmount: 15_000_000,
    notes: "Dana renovasi dan perbaikan fasilitas masjid menjelang Ramadhan",
  },
  {
    id: "paket-sembako",
    emoji: "📦",
    title: "Paket Sembako Ramadhan",
    category: "santunan",
    categoryLabel: "Santunan",
    targetAmount: 8_000_000,
    notes: "Membagikan paket sembako kepada warga kurang mampu di sekitar masjid",
  },
];
