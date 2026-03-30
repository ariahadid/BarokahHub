# PRD – BarakahHub Hub

## 1. Ringkasan Eksekutif

Produk ini adalah web app ringan untuk membantu pengurus masjid / komunitas kecil membuat halaman program Ramadhan (jadwal kegiatan + donasi) secara instan dengan bantuan AI, dan menghubungkannya ke pembayaran online melalui Mayar.

Fokus utama:
- Pengurus cukup mengisi form singkat tentang masjid dan program Ramadhan.
- AI otomatis membuat deskripsi program, teks broadcast WhatsApp, dan caption media sosial.
- Jamaah bisa melihat jadwal program Ramadhan dan berdonasi ke program tertentu melalui link kampanye Mayar.

Tujuan:
- Memudahkan masjid kecil bertransformasi ke donasi digital tanpa tim IT.
- Menunjukkan kekuatan AI + vibecoding + ekosistem pembayaran Mayar dalam 1 solusi end-to-end saat hackathon VIBECODING 2026.

---

## 2. Latar Belakang & Problem

### 2.1 Latar Belakang

- Donasi dan infaq adalah sumber utama operasional masjid; banyak masjid masih mengandalkan kotak fisik dan pengumuman lisan.
- Lembaga besar (Lazismu, Rumah Zakat, Dompet Dhuafa, dll.) sudah lama mengedukasi donasi online, terutama di Ramadhan, dan menyediakan halaman kampanye terstruktur untuk program masjid dan sosial.[web:25][web:28][web:34][web:36][web:37]
- Namun, masjid kecil/komunitas lokal jarang punya halaman program Ramadhan yang rapi dengan jalur donasi online yang jelas dan mudah.

### 2.2 Problem Utama

1. **Pengurus masjid kesulitan membuat konten & halaman program:**
   - Tidak terbiasa menulis deskripsi program yang persuasif.
   - Tidak punya kemampuan desain untuk poster/landing page.
   - Ribet mengelola beberapa program (buka puasa, santunan, kajian) dengan kebutuhan dana berbeda.

2. **Jamaah bingung harus donasi ke mana & program apa:**
   - Informasi program tersebar di poster fisik, status WA, dan pengumuman lisan yang mudah lupa.
   - Tidak ada satu link yang merangkum seluruh program Ramadhan dan tombol donasi online yang jelas per program.

3. **Adopsi donasi online di level masjid kecil masih rendah:**
   - Padahal ekosistem donasi online dan payment gateway sudah matang dan dipercaya.[web:25][web:28][web:34][web:50]

---

## 3. Tujuan Produk & KPI

### 3.1 Tujuan Produk

- Membuat pembuatan halaman program Ramadhan + donasi untuk masjid/komunitas kecil menjadi proses < 10 menit dengan bantuan AI.
- Menghubungkan setiap program Ramadhan ke link donasi Mayar dengan UX yang sederhana dan jelas.
- Menampilkan value Mayar sebagai infrastruktur donasi/galang dana yang bisa dipakai masjid secara mandiri.[web:27]

### 3.2 Indikator Keberhasilan (untuk konteks hackathon)

- 1–3 masjid/komunitas contoh berhasil dibuat di staging/production (data bisa dummy).
- Setiap masjid punya minimal 2–3 program Ramadhan dengan:
  - Halaman publik berisi deskripsi program dan tombol donasi (Mayar).
  - Deskripsi program + teks WA + caption IG hasil AI.
- Flow demo:
  - Daftarkan masjid → buat program → generate konten AI → lihat halaman publik → klik tombol “Donasi Sekarang” yang mengarah ke halaman pembayaran Mayar berjalan lancar.
- Juri dapat memahami dengan cepat:
  - Di mana AI dipakai dalam produk.
  - Di mana Mayar berperan sebagai infrastruktur pembayaran & donasi.[web:27]

---

## 4. Ruang Lingkup (Scope)

### 4.1 In Scope (MVP Hackathon)

- Web app (desktop & mobile browser friendly).
- Manajemen masjid (registrasi basic & profil).
- Manajemen program Ramadhan per masjid.
- Generasi konten berbasis AI:
  - Deskripsi program.
  - Teks broadcast WhatsApp.
  - Caption Instagram/Facebook.
- Halaman publik masjid & daftar program.
- Halaman publik detail program (termasuk tombol “Donasi Sekarang”).
- Integrasi dengan Mayar:
  - Menyimpan & menampilkan link kampanye Mayar per program (link bisa dibuat manual di dashboard Mayar atau via helper API sederhana).
- Dashboard ringan untuk pengurus (minimal untuk demo).

### 4.2 Out of Scope (bisa disebut sebagai future work)

- Sistem otentikasi & otorisasi kompleks multi-role.
- Pengelolaan donatur & kuitansi pajak sendiri (sudah disediakan Mayar).[web:27]
- Donasi rutin otomatis, reminder berkala, dan notifikasi transaksional penuh (bisa dilakukan Mayar/WA Business di masa depan).[web:27][web:50]
- Sistem laporan keuangan internal masjid yang lengkap.
- Aplikasi mobile native.

---

## 5. Persona & Use Case

### 5.1 Persona 1 – Pengurus Masjid

- Umur 25–55 tahun, aktif di WhatsApp, menggunakan smartphone setiap hari.
- Tugas: mengurus kegiatan Ramadhan, mencari dana operasional, berkomunikasi dengan jamaah.
- Pain point:
  - Sulit menyusun konten ajakan donasi yang menarik.
  - Capek menjawab pertanyaan berulang soal jadwal kegiatan & kebutuhan dana.
  - Tidak punya tim IT atau desainer.

Use case utama:
- Mendaftarkan masjid di platform.
- Membuat beberapa program Ramadhan dan mendapatkan halaman publik + teks promosi otomatis.
- Menghubungkan program ke link donasi Mayar.

### 5.2 Persona 2 – Jamaah / Donatur Lokal

- Rajin hadir di masjid atau aktif mengikuti kajian online.
- Sudah biasa menggunakan mobile banking/e-wallet untuk donasi ke lembaga filantropi.[web:25][web:28][web:34][web:31]
- Ingin berkontribusi ke masjidnya sendiri, tapi:
  - Tidak selalu bisa hadir fisik.
  - Bingung kanal donasi & informasi program yang jelas.

Use case utama:
- Membuka link masjid (misal dari WA/IG).
- Melihat daftar program Ramadhan dan informasi singkat tiap program.
- Klik “Donasi Sekarang” dan menyelesaikan pembayaran melalui halaman Mayar.

---

## 6. User Journey (MVP)

### 6.1 Journey Pengurus Masjid

1. Masuk ke landing page.
2. Klik “Daftarkan Masjid”.
3. Isi form masjid:
   - Nama masjid.
   - Alamat / kota.
   - Kontak WhatsApp.
   - Deskripsi singkat (opsional).
4. Setelah masjid terdaftar, diarahkan ke halaman “Buat Program Ramadhan Pertama”.
5. Isi form program:
   - Nama program.
   - Kategori (buka puasa, santunan, kajian, renovasi, dll.).
   - Tanggal/waktu.
   - Target dana (opsional).
   - Tujuan/niat (free text pendek).
6. Klik “Generate Konten dengan AI”.
7. Sistem memanggil LLM dan menampilkan:
   - Deskripsi program.
   - Draft teks WA.
   - Draft caption IG.
8. Pengurus bisa review & edit singkat, lalu klik “Simpan Program”.
9. Sistem meminta link kampanye Mayar untuk program tersebut (atau bantu generate):
   - Input manual URL kampanye Mayar, atau
   - (Opsional) Panggil helper API yang mempersiapkan link kampanye dasar di Mayar.[web:27]
10. Program tersimpan dan tampil di:
    - Dashboard pengurus.
    - Halaman publik masjid → daftar program.

### 6.2 Journey Jamaah

1. Menerima link halaman masjid (dari WA/IG atau website).
2. Membuka halaman masjid:
   - Melihat nama, lokasi, deskripsi singkat.
   - Melihat daftar program Ramadhan.
3. Klik salah satu program:
   - Membaca deskripsi, tanggal, target dana.
   - Melihat tombol “Donasi Sekarang”.
4. Klik “Donasi Sekarang”:
   - Dialihkan ke halaman donasi Mayar untuk program terkait.
5. Menyelesaikan pembayaran di Mayar.

---

## 7. Fitur & Requirement Fungsional

### 7.1 Manajemen Masjid

**Fitur:**
- Form pendaftaran masjid.
- Halaman profil masjid.

**Requirement:**
1. Sistem harus menyediakan form:
   - `name`, `address`, `city`, `contact_whatsapp`, `description` (opsional).
2. Sistem harus membuat slug unik untuk masjid (mis. `masjid-darul-huda`).
3. Sistem harus menyediakan halaman publik `/m/:slug` yang menampilkan:
   - Nama masjid, alamat, kontak WA (link klik-untuk-chat).
   - Deskripsi singkat (bisa kosong).
   - Daftar program Ramadhan (jika ada).

### 7.2 Manajemen Program Ramadhan

**Fitur:**
- Form buat program baru.
- Listing program di dashboard.
- Listing program di halaman masjid.

**Requirement:**
1. Form program minimal memiliki field:
   - `title`, `category`, `event_date`, `target_amount` (opsional), `notes`/`intent`.
2. Sistem menyimpan program terkait dengan `mosque_id`.
3. Program memiliki slug unik `/p/:slugProgram`.
4. Program punya status (`draft`, `published`, `finished`) – minimal `draft` dan `published` untuk MVP.
5. Di halaman masjid, program yang `published` tampil sebagai card dengan:
   - Judul, kategori, tanggal, ringkasan singkat (mis. 1–2 kalimat pertama deskripsi AI).

### 7.3 Generasi Konten AI

**Fitur:**
- Tombol “Generate Konten dengan AI” di form program.
- Preview & edit konten.

**Requirement:**
1. Backend menyediakan endpoint:
   - `POST /api/programs/:id/generate-content`
2. Input ke LLM minimal:
   - Data masjid (nama, kota, deskripsi singkat).
   - Data program (judul, kategori, tanggal, target dana, niat/tujuan).
3. Output LLM di-parse menjadi 3 bagian:
   - `ai_description` (3–5 paragraf).
   - `ai_whatsapp_text` (2–4 paragraf + beberapa bullet ajakan).
   - `ai_instagram_caption` (<= 150 kata + 3–5 hashtag).
4. Hasil disimpan di tabel `program_contents`.
5. UI menampilkan form textarea untuk masing-masing field agar pengurus bisa mengedit sebelum menyimpan.

### 7.4 Integrasi Mayar (Link Donasi)

**Fitur:**
- Penyimpanan & penampilan link kampanye Mayar per program.
- Tombol “Donasi Sekarang” di halaman program.

**Requirement:**
1. Di form program (atau step lanjutan) pengurus dapat mengisi:
   - `mayar_campaign_url` (string).
2. Jika field ini terisi, di halaman detail program tampil tombol “Donasi Sekarang” yang mengarah ke URL tersebut.
3. (Opsional) Validasi sederhana bahwa URL mengandung domain Mayar (`mayar.id`, `*.mayar.link`, dsb.).[web:27]
4. (Opsional) Sediakan helper teks di UI yang menjelaskan:
   - “Buat kampanye donasi program ini di dashboard Mayar, lalu paste link ke sini.”

### 7.5 Dashboard Pengurus

**Fitur:**
- Tabel/list program per masjid.
- Aksi copy teks WA / caption IG.

**Requirement:**
1. Halaman dashboard sederhana (bisa `/dashboard?mosque_id=X`) yang menampilkan semua program milik masjid X.
2. Setiap baris menampilkan:
   - Judul program.
   - Status.
   - Link ke halaman program publik.
   - Link kampanye Mayar (jika ada).
3. Tersedia tombol:
   - “Copy teks WA” → menyalin `ai_whatsapp_text` ke clipboard.
   - “Copy caption IG” → menyalin `ai_instagram_caption` ke clipboard.

---

## 8. Requirement Non-Fungsional

1. **Performa:**
   - Halaman publik masjid & program harus load < 2 detik pada koneksi 4G rata-rata.
2. **Keamanan:**
   - Tidak menyimpan data pembayaran, hanya menyimpan URL kampanye Mayar.
   - Endpoint generate konten AI jangan diekspos tanpa pembatasan (bisa pakai rate limit sederhana atau hanya akses lewat UI).
3. **Ketersediaan:**
   - Aplikasi di-deploy di environment yang stabil (Vercel/Render dsb.) selama periode penjurian.
4. **Usability:**
   - UI mobile-friendly karena mayoritas user akan akses via HP.
   - Form dibuat sesingkat mungkin untuk pengurus masjid.
5. **Maintainability:**
   - Struktur kode terorganisir (Next.js app router + modul untuk masjid, program, AI, Mayar).
   - Konfigurasi API key LLM & setting Mayar lewat environment variables.

---

## 9. Arsitektur & Stack Teknis (Usulan)

- **Frontend:** Next.js (App Router) + TypeScript, Tailwind CSS.
- **Backend:** API Routes / Server Actions di Next.js.
- **Database:** Supabase / Neon + Drizzle ORM (`mosques`, `programs`, `program_contents`).
- **AI/LLM:** Claude / OpenAI via REST API.
- **Integrasi Mayar:** Penyimpanan link kampanye Mayar per program, opsi untuk menambah helper kecil jika API publik Mayar tersedia.[web:27]
- **Deployment:** Vercel (frontend+backend) + Supabase/Neon DB.

---

## 10. Risiko & Mitigasi

1. **Risiko:** Waktu hackathon terbatas, fitur terlalu melebar.
   - *Mitigasi:* Fokus ke 3 flow utama:
     - Daftar masjid.
     - Buat program + generate konten.
     - Lihat halaman publik + klik donasi (Mayar).

2. **Risiko:** Konten AI tidak selalu sesuai tone Islami/etis.
   - *Mitigasi:*
     - Tambah bagian “guideline konten” di prompt.
     - Ubah hasil manual sebelum publish jika ada yang kurang pantas.

3. **Risiko:** Pengurus masjid nyata belum siap memakai (untuk versi demo).
   - *Mitigasi:* Pakai data dummy 1–2 masjid untuk demo; jelaskan potensi real-nya saat presentasi.

4. **Risiko:** Perubahan API/limit LLM.
   - *Mitigasi:* Cache hasil AI di DB; proses generate konten hanya dilakukan sekali per program, bukan setiap page load.

---

