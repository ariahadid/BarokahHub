import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-emerald-700 text-lg">BarakahHub</span>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Masuk
          </Button>
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
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6"
          >
            Daftarkan Masjid Anda
          </Button>
        </Link>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl mb-3">1</div>
            <h3 className="font-semibold mb-2">Daftarkan Masjid</h3>
            <p className="text-sm text-slate-600">
              Isi nama, alamat, dan kontak masjid. Cukup 2 menit.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl mb-3">2</div>
            <h3 className="font-semibold mb-2">Buat Program + AI</h3>
            <p className="text-sm text-slate-600">
              Buat program Ramadhan dan generate konten promosi otomatis dengan
              AI.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl mb-3">3</div>
            <h3 className="font-semibold mb-2">Terima Donasi</h3>
            <p className="text-sm text-slate-600">
              Hubungkan ke Mayar dan bagikan link ke jamaah via WhatsApp &
              Instagram.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
