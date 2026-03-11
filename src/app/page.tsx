import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Building2, TrendingUp, ArrowRight, Star, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none block -mt-0.5">B</span>
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">Barokah<span className="text-emerald-600">Hub</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 rounded-full px-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                Daftar Masjid
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-teal-50/60 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Platform Donasi Masjid Terpercaya
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight lg:leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            Bersama Membangun <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Kebaikan</span>
            <br className="hidden md:block" /> dari Masjid ke Pelosok Negeri
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            Platform modern untuk mengelola program Ramadhan dan donasi masjid Anda. Transparan, mudah digunakan, dan tanpa biaya langganan.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-slate-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                Mulai Donasi
                <Heart className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform text-emerald-400" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 group bg-white">
                Daftarkan Masjid
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Masjid Bergabung", value: "1,240+", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Program Kebaikan", value: "5,000+", icon: Heart, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Donasi Tersalurkan", value: "Rp 10M+", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" }
            ].map((stat, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                <p className="text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Dipercaya oleh Ribuan Masjid</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Bergabunglah dengan pengurus masjid lainnya yang telah merasakan kemudahan mengelola program dan donasi bersama BarokahHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                mosque: "Masjid Al-Ikhlas",
                location: "Jakarta Selatan",
                image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800&h=600",
                text: "Alhamdulillah, penggalangan dana untuk renovasi atap masjid jadi lebih mudah dan transparan. Jamaah sangat antusias."
              },
              {
                mosque: "Masjid Raya Baiturrahman",
                location: "Bandung",
                image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=800&h=600",
                text: "Fitur program Ramadhan sangat membantu panitia dalam mengatur jadwal buka puasa bersama dan i'tikaf."
              },
              {
                mosque: "Masjid Nurul Huda",
                location: "Yogyakarta",
                image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&q=80&w=800&h=600",
                text: "Donasi online membuat pemasukan masjid meningkat signifikan, terutama dari jamaah yang berada di luar kota."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.mosque} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <h4 className="text-white font-bold text-lg leading-tight">{item.mosque}</h4>
                    <div className="flex items-center text-white/90 text-sm mt-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {item.location}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex text-amber-400 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed text-sm lg:text-base">"{item.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer minimalis */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-slate-700">BarokahHub</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} BarokahHub. Bersama menebar kebaikan.</p>
        </div>
      </footer>
      
      {/* Global styles for simple animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}} />
    </div>
  );
}
