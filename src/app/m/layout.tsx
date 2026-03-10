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
