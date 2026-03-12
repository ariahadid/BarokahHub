"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Building2, TrendingUp, ArrowRight, Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isCounting) {
        setIsCounting(true);
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          setCount(Math.floor(progress * (2 - progress) * end));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }
    }, { threshold: 0.1 });

    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.disconnect(); };
  }, [end, duration, isCounting]);

  return { count, ref };
}

function StatCounter({ end, prefix = "", suffix = "" }: { end: number, prefix?: string, suffix?: string }) {
  const { count, ref } = useCountUp(end);
  return <h3 ref={ref} className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 tracking-tight">{prefix}{count.toLocaleString("id-ID")}{suffix}</h3>;
}

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      mosque: "Masjid Al-Ikhlas",
      role: "Panitia Ramadhan",
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=200&h=200",
      text: "Program iftar kami terbantu banget karena donatur mudah transfer pakai QRIS & VA."
    },
    {
      mosque: "Hamba Allah",
      role: "Donatur Rutin",
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=200&h=200",
      text: "Saya bisa mudah bersedekah subuh pakai aplikasi dari rumah. Sangat praktis."
    },
    {
      mosque: "Masjid Nurul Huda",
      role: "Bendahara DKM",
      image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&q=80&w=200&h=200",
      text: "Laporan uang masuk langsung auto-update, gak perlu rekap Excel manual tiap malam."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

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

        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Platform Donasi Masjid Terpercaya
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight lg:leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                Bersama Membangun <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Kebaikan</span>
                <br className="hidden md:block" /> dari Masjid ke Pelosok Negeri
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                Platform modern untuk mengelola program Ramadhan dan donasi masjid Anda. Transparan, mudah digunakan, dan tanpa biaya langganan.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
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

            {/* Right Image */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10 transition-opacity duration-300"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1000&h=1200" 
                  alt="Ilustrasi Masjid" 
                  className="w-full h-[400px] lg:h-[550px] object-cover animate-float"
                />
                
                {/* Floating Card UI */}
                <div className="absolute bottom-6 left-6 right-6 z-20 animate-fade-in-up" style={{ animationDelay: '1000ms', animationFillMode: 'both' }}>
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl flex items-center gap-5 border border-white/20">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center shadow-inner">
                      <Heart className="w-7 h-7 text-emerald-600 fill-emerald-100" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Donasi Terkumpul Hari Ini</p>
                      <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Rp 12.500.000</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind image */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Stats Section */}
      <section className="py-24 bg-white relative z-10 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Angka yang Berbicara</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Dampak nyata dari setiap donasi yang Anda salurkan melalui BarokahHub.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { label: "Masjid Terdaftar", end: 1240, suffix: "+", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Program Aktif", end: 5200, suffix: "+", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Donatur Tangguh", end: 125, suffix: "K+", icon: Heart, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Donasi Tersalurkan", end: 10, prefix: "Rp ", suffix: "M+", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" }
            ].map((stat, i) => (
              <div key={i} className="group p-6 lg:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <StatCounter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                <p className="text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Testimonials */}
      {/* Showcase / Testimonials */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Dipercaya oleh Ribuan Masjid</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Kisah sukses pengurus masjid yang telah merasakan kemudahan mengelola program dan donasi bersama BarokahHub.
            </p>
          </div>

          {/* Highlight Success Story */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-md border border-slate-100 mb-12 flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/3 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 -z-10"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=600&h=600" 
                  alt="Renovasi Masjid" 
                  className="w-full max-w-[280px] mx-auto rounded-3xl object-cover border-4 border-white shadow-lg"
                />
              </div>
            </div>
            <div className="md:w-2/3">
              <div className="flex text-amber-400 mb-4">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">&ldquo;Renovasi Atap Masjid Selesai 2 Bulan Lebih Cepat&rdquo;</h3>
              <p className="text-lg text-slate-600 italic leading-relaxed mb-6">
                &ldquo;Sebelumnya mengumpulkan dana 300 juta untuk atap terasa sangat berat. Kami harus keliling pakai kotak amal keliling RT. Namun sejak pakai link galang dana dari platform ini, jamaah kami yang sedang merantau di Surabaya dan Jakarta bisa ikut urunan setiap gajian. Transparan, laporannya rapi, dan cepat cair.&rdquo;
              </p>
              <div>
                <p className="font-bold text-slate-900 text-lg">Ustadz Ahmad Ridhwan</p>
                <div className="flex items-center text-slate-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  DKM Masjid Al-Hidayah, Bandung Raya
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="max-w-4xl mx-auto relative px-4 md:px-12">
            <div className="overflow-hidden relative rounded-2xl bg-white p-8 md:p-10 shadow-sm border border-slate-100">
              <div 
                className="flex transition-transform duration-700 ease-in-out" 
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((item, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4 flex flex-col items-center text-center transition-opacity duration-700" style={{ opacity: currentTestimonial === i ? 1 : 0.3 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.mosque} className="w-20 h-20 rounded-full object-cover mb-6 border-4 border-emerald-50 shadow-sm" />
                    <p className="text-xl md:text-2xl text-slate-700 italic leading-relaxed mb-6">&ldquo;{item.text}&rdquo;</p>
                    <h4 className="font-bold text-slate-900 text-lg">{item.mosque}</h4>
                    <p className="text-emerald-600 font-medium">{item.role}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:scale-110 transition-all z-10 hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:scale-110 transition-all z-10 hidden md:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-emerald-600 w-8' : 'bg-slate-300 hover:bg-emerald-400'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Final Call to Action */}
      <section className="py-24 relative overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-800 to-emerald-950 opacity-80"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Siap Memakmurkan Masjid Anda?</h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabung secara gratis sekarang. Waktu pendaftaran kurang dari 5 menit, dan dana donasi bisa Anda cairkan kapan saja.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-emerald-50 font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-80"></span>
              Pencairan 1x24 Jam
            </div>
            <div className="flex items-center gap-2 text-emerald-50 font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-80"></span>
              Laporan Terbuka & Realtime
            </div>
            <div className="flex items-center gap-2 text-emerald-50 font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-80"></span>
              Aman & Diawasi DSN-MUI
            </div>
          </div>
          
          <Link href="/register">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full px-12 py-7 text-xl font-bold shadow-xl shadow-amber-500/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105">
              Mulai Bantu Masjid Sekarang
            </Button>
          </Link>
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
