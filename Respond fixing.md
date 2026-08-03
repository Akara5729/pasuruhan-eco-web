# 📋 Rencana Perbaikan Sistem & Peningkatan GUI Visual (Respond Fixing)

Dokumen ini merupakan hasil kesepakatan desain komprehensif untuk menjawab 3 poin kritik dan saran peningkatan estetika pada aplikasi **Pasuruhan Eco-Web**.

---

## 1. Pengalaman Pengguna: Multi-Stage Animated Progress Bar & Dynamic Eco Tips
### 🔍 Masalah yang Terjadi
Saat pengguna memindai sampah, indikator yang muncul hanyalah spinner lingkaran sederhana tanpa informasi seberapa jauh proses berjalan. Pengguna tidak mengetahui tahapan apa yang sedang diproses oleh sistem (preprocessing gambar, AI object detection, hingga kalkulasi ekonomi).

### 🛠️ Solusi & Spesifikasi Desain (Telah Disepakati):
1. **Multi-Stage Animated Progress Bar (0% → 100%):**
   - Bar persentase linear dengan aksen *emerald gradient glow* (`from-emerald-400 via-teal-400 to-emerald-500`) yang bertransisi secara halus.
2. **Tahapan Proses Berurutan (Stage Stepper):**
   - **Tahap 1 (0% - 30%):** ⚡ *Optimalisasi Gambar & Auto-Contrast*
   - **Tahap 2 (30% - 75%):** 🤖 *Menganalisis Objek dengan Two-Stage AI (Roboflow + Cloudflare Vision)*
   - **Tahap 3 (75% - 95%):** 💡 *Mengkalkulasi Kategori & Estimasi Nilai Ekonomi*
   - **Tahap 4 (100%):** ✨ *Menyiapkan Hasil Analisis*
3. **Dynamic Eco Facts (Fakta Singkat Berganti-Ganti):**
   - Menampilkan tips & fakta daur ulang acak yang berganti setiap 2.5 detik saat proses loading berlangsung agar pengguna teredukasi dan tidak merasa bosan menunggu.
4. **Desain Tampilan:**
   - Backdrop semi-transparan berbalut efek *frosted glass* (`backdrop-blur-md bg-black/75`).
   - Kartu loading modern di tengah dengan preview foto yang sedang dipindai berbingkai *subtle pulsing glow*.

---

## 2. Perbaikan Teks "Pemindai Sampah" (Font Putih di Latar Terang)
### 🔍 Masalah yang Terjadi
Pada `ScannerEngine.tsx`, parent container memiliki class `text-white` yang menimpa `text-eco-text`, sementara latar belakangnya adalah `bg-eco-bg` (#f8f9fa / abu-abu sangat terang). Akibatnya teks judul `<h2>` "Pemindai Sampah" menjadi putih di atas latar terang sehingga **tidak terlihat / tidak terbaca**.

### 🛠️ Solusi & Spesifikasi Perbaikan:
1. Menghapus class `text-white` yang konflik dari parent container.
2. Menetapkan pewarnaan teks judul `<h2>` secara eksplisit: `text-slate-900 font-extrabold tracking-tight text-2xl sm:text-3xl`.
3. Subtitle menggunakan warna kontras yang ramah mata: `text-slate-600 font-normal text-sm`.

---

## 3. Peningkatan Visual GUI: Tema Eco-Modern Minimalist
### 🎨 Arah Desain Visual:
Mengusung konsep **Eco-Modern Minimalist** dengan perpaduan warna hijau emerald segar, putih bersih, kartu *soft glassmorphism*, dan interaksi mikro yang mewah.

### 🌟 Komponen & Fitur Visual Baru:
1. **Header & Identitas Komunitas:**
   - Menambahkan badge identitas: `🌿 Desa Pasuruhan Kidul • Sistem Pengelolaan Sampah Cerdas`.
2. **3 Interactive Value Badges:**
   - ⚡ **AI Vision 2-Stage:** *Deteksi Akurat Berbasis YOLO & Vision AI*
   - 💰 **Nilai Ekonomi:** *Kalkulasi Otomatis Harga Jual Sampah*
   - ♻️ **Panduan Daur Ulang:** *Langkah Pemilahan & Prosedur 3R*
3. **Tombol Aksi Utama (Hero CTA):**
   - Tombol **"Buka Kamera"** berukuran besar berbentuk *pill* dengan warna gradasi emerald-to-teal, efek *soft ambient shadow*, dan animasi klik mikro (*active:scale-95*).
   - Tombol sekunder **"Pilih dari Galeri"** dengan kartu minimalis bergaris tepi halus (*crisp border*).
4. **Animated Laser Scanner Viewfinder:**
   - Saat kamera aktif, sudut bidik (*viewfinder*) dilengkapi garis laser hijau berpendar yang bergerak naik-turun secara halus untuk memberikan efek pemindaian teknologi tinggi.

---

## 📁 File yang Akan Dimodifikasi:
1. `src/views/ScannerView.tsx`: Mengintegrasikan *Multi-Stage Progress Bar* dan *Dynamic Eco Tips Carousel*.
2. `src/components/scanner/ScannerEngine.tsx`: Merombak tampilan GUI Awal (Hero Screen), memperbaiki warna teks, serta menambahkan animasi laser pada viewfinder.
3. `src/index.css`: Menambahkan animasi scan laser dan gradient utility jika diperlukan.

---

## 🛑 Status Eksekusi
Rencana telah siap sepenuhnya. Menunggu instruksi konfirmasi dari Anda sebelum eksekusi kode dimulai!
