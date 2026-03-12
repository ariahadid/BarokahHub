import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-600 mb-6">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
