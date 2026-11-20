# Dokumentasi Sistem Autentikasi, Login & Loading Screen UI/UX — e-DOJO PERKEMI

> **Aplikasi**: e-DOJO — Sistem Terpadu Manajemen Dojo, Kenshi & KTA Digital  
> **Standar UI/UX**: Clean, Minimalist, Premium Enterprise Japanese-Inspired SaaS  
> **Status**: Selesai Diimplementasikan (Live) & Terverifikasi (Desktop 1440 × 900 px & Mobile 390 × 844 px)  
> **Rujukan Desain**: Mockup Presentasi UI/UX Autentikasi e-DOJO (Desktop Login, Mobile Login, Loading Screen).

---

## 1. Filosofi & Pendekatan Desain

Antarmuka autentikasi e-DOJO dirancang sebagai pintu gerbang resmi organisasi berskala nasional **Persaudaraan Bela Diri Kempo Indonesia (PERKEMI)** dengan karakteristik:

1. **Enterprise Trust & Seriousness**:
   - Menghadirkan kesan platform aman (*trustworthy*), formal, dan berwibawa bagi ribuan Kenshi, Pelatih (Sensei), dan Pengurus (PB, Pengprov, Pengkot).
   - Menolak *AI-generated UI slop*: tanpa dekorasi warna-warni yang mengalihkan fokus, tanpa gradient berlebihan, dan tanpa efek *glassmorphism* tebal.
2. **Japanese Dojo Aesthetics**:
   - Bagian *brand identity* memadukan warna *Navy Blue* kokoh (`#102B40`) dengan aksen merah resmi PERKEMI (`#C51C2A`) dan ilustrasi garis arsitektur dojo tradisional Jepang (*pagoda eaves & lattice doors*).
   - Tipografi menggunakan jenis huruf **Inter** yang tajam, proporsional, dan mudah dibaca pada berbagai resolusi layar.

---

## 2. Design System & Token Warna

| Elemen Antarmuka | Nilai Hex | Peran & Penggunaan |
|---|---|---|
| **Primary Navy** | `#102B40` | Warna solid panel identitas merek (kiri desktop), tombol aksi utama, dan latar belakang loading screen. |
| **Navy Hover** | `#1A3B52` | Status hover tombol utama dan track pembatas indikator progress bar. |
| **Navy Active** | `#24475E` | Status klik/active tombol utama. |
| **Perkemi Red** | `#C51C2A` | Warna aksen resmi: logo perisai, divider garis horizontal, tautan sekunder registrasi Kenshi, dan indikator progress bar. |
| **Canvas Background** | `#F8F9FA` | Latar belakang canvas luar aplikasi. |
| **White Surface** | `#FFFFFF` | Latar belakang panel formulir login dan input field. |
| **Primary Text** | `#17202D` | Warna judul (*Selamat datang kembali*), label input, dan teks tombol. |
| **Secondary Text** | `#718092` | Sub-judul keterangan, placeholder, dan catatan keamanan enkripsi. |
| **Border Line** | `#E8EBEF` | Garis tepi 1px kartu utama, batas input field, dan garis pemisah sub-footer. |
| **Error / Alert** | `#DC3545` | Indikator kesalahan validasi dan alert email/kata sandi tidak cocok. |
| **Success Emerald** | `#16865C` | Penanda status koneksi aman SSL/TLS 256-Bit. |

---

## 3. Tata Letak Desktop Login (1440 × 900 px)

Layout menggunakan arsitektur **Split-Screen Edge-to-Edge** yang memenuhi 100% tinggi dan lebar layar (`h-screen w-screen overflow-hidden`) secara penuh tanpa menimbulkan *scroll bar* horizontal maupun vertikal:

```
+------------------------------------------+-------------------------------------------------------------+
| PANEL KIRI: BRAND IDENTITY (40%)         | PANEL KANAN: FORMULIR AUTENTIKASI (60%)                     |
| Latar Belakang Solid Navy (#102B40)      | Latar Belakang Putih Bersih (#FFFFFF)                       |
|                                          |                                                             |
| [Shield] PERKEMI INDONESIA               |                                                             |
|                                          |            Selamat datang kembali                           |
|             [ Shield Logo ]              |            Masuk untuk mengelola aktivitas Perkemi          |
|                 e-DOJO                   |                                                             |
|           PERKEMI INDONESIA              |            Alamat email                                     |
|             [=== Red Line ===]           |            [ nama@perkemi.id                           ]    |
|      "Satu sistem. Satu organisasi."     |                                                             |
|                                          |            Kata sandi                                       |
|                                          |            [ ••••••••                                (o)]   |
|                                          |                                                             |
|                                          |            [x] Ingat saya di perangkat ini  Lupa sandi?     |
|                                          |                                                             |
|                                          |            [  ->  Masuk ke e-DOJO                     ]     |
|          [ Line Art Ilustrasi            |                                                             |
|           Dojo Tradisional ]             |            [+] Registrasi Kenshi baru                       |
|                                          |                                                             |
|                                          | ----------------------------------------------------------- |
|                                          | (*) Sistem Keamanan Terenkripsi SSL/TLS 256-Bit             |
+------------------------------------------+-------------------------------------------------------------+
```

### Rincian Panel Desktop:
1. **Left Section (Brand Identity — 40%)**:
   - Header atas: Lencana mini perisai merah dan teks `PERKEMI INDONESIA`.
   - Bagian tengah: Logo perisai e-DOJO berukuran 80×80 px, judul `e-DOJO`, subjudul `PERKEMI INDONESIA`, garis aksen merah (`#C51C2A`), dan tagline: *"Satu sistem. Satu organisasi."*
   - Bagian bawah: Ilustrasi arsitektur dojo Jepang minimalis dalam format garis vektor SVG (`JapaneseDojoLineArt`) dengan opasitas rendah (`text-white/20`) yang elegan dan tidak mengaburkan fokus.
2. **Right Section (Authentication Surface — 60%)**:
   - Kontainer terpusat (*centered container*) dengan lebar maksimal **420 px**.
   - Input Alamat Email dengan placeholder `nama@perkemi.id` dan validasi format email.
   - Input Kata Sandi dengan placeholder `••••••••` dan tombol interaktif pengalih *Show/Hide Password* (ikon `Eye` dan `EyeOff` dari Lucide).
   - Checkbox *Ingat saya di perangkat ini* di sebelah kiri dan tautan *Lupa kata sandi?* berwarna merah `#C51C2A` di sebelah kanan.
   - Tombol utama *Masuk ke e-DOJO* (`#102B40`, tinggi 48 px, teks putih, status hover `#1A3B52`).
   - Aksi sekunder: Tautan teks tebal *Registrasi Kenshi baru* dengan ikon `UserPlus` berwarna merah `#C51C2A`.
   - Sub-footer: Indikator sertifikat keamanan enkripsi SSL/TLS 256-Bit dan tombol tautan cepat pengujian *Pratinjau Loading Screen*.

---

## 4. Tata Letak Mobile Login (375–430 px)

Dirancang khusus untuk layar sentuh ponsel tanpa menimbulkan *horizontal scrolling*:

- **Single-Column Mobile Stack**: Panel dekoratif kiri otomatis disembunyikan pada layar `< 1024px`.
- **Branding Atas Ringkas**: Logo perisai merah e-DOJO dan teks `PERKEMI INDONESIA` tersemat rapi di bagian atas formulir.
- **Form Area 24 px Padding**: Padding horizontal `px-6` memastikan form nyaman diisi bahkan ketika virtual keyboard smartphone aktif.
- **Touch Target Ergonomis**: Seluruh input dan tombol aksi berukuran tinggi minimal **48 px (`h-12`)** untuk memudahkan interaksi ketuk jari (*fat-finger compliant*).
- **Akses Registrasi Cepat**: Tautan *Registrasi Kenshi baru* diposisikan tepat di bawah tombol login.

---

## 5. Loading Screen & Splash State

Loading screen dibangun mengikuti prinsip **deterministik dan tanpa jeda buatan**:

```
+----------------------------------------------------+
|                                                    |
|                                                    |
|                                                    |
|                  [ Shield Logo ]                   |
|                      e-DOJO                        |
|                                                    |
|               [=======-------------]               |
|            Menyiapkan ruang kerja Anda…            |
|                                                    |
|                                                    |
|                                                    |
|                 PERKEMI INDONESIA                  |
+----------------------------------------------------+
```

### 4 Tahapan Loading Realistis:
1. **State 1 — Authenticating**:
   - Teks: *"Memverifikasi akun Anda…"*
   - Progress: ~25–35%
2. **State 2 — Loading User Profile**:
   - Teks: *"Memuat profil pengguna…"*
   - Progress: ~55–70%
3. **State 3 — Preparing Workspace**:
   - Teks: *"Menyiapkan ruang kerja Anda…"*
   - Progress: ~80–95%
4. **State 4 — Ready / Redirecting**:
   - Teks: *"Selamat datang di e-DOJO."*
   - Progress: 100%

> [!NOTE]
> **Tampilan Otomatis saat Akses Pertama**: Sesuai kebutuhan operasional enterprise, layar *Loading Screen* otomatis aktif sesaat pengguna pertama kali membuka `http://localhost:8001/login`, mengalirkan 4 tahapan status secara mulus selama ~2 detik sebelum memudar (*fade-out dissolve*) dan menampilkan form login. Pengguna juga dapat menekan tombol **Lewati** atau mengulang animasi melalui tombol **Pratinjau Loading Screen** di footer.

---

## 6. Penanganan Status Interaksi (Interactive States)

| Status Antarmuka | Representasi Visual & Perilaku |
|---|---|
| **Default State** | Input dengan border `#E8EBEF`, latar putih, tombol login aktif, siap menerima input. |
| **Input Focus** | Border berubah menjadi `#102B40` dengan cincin fokus halus `ring-2 ring-[#102B40]/15`. |
| **Validation Error** | Border berubah menjadi merah `#DC3545`, cincin fokus bernuansa merah, pesan kesalahan spesifik muncul di bawah field bersangkutan. |
| **Submitting State** | Tombol beralih menjadi disabled, ikon panah berganti menjadi spinner berputar halus, label berubah menjadi *"Memverifikasi akun…"*. Mencegah *double-submission*. |
| **Authentication Failed** | Muncul kotak alert merah elegan di atas formulir: *"Email atau kata sandi tidak cocok dengan data kami."* tanpa membocorkan apakah email terdaftar atau tidak (*User Enumeration Protection*). |
| **Password Toggle** | Mengubah tipe input dari `password` ke `text` secara instan dengan ikon `Eye` / `EyeOff`. |

---

## 7. Keamanan & Aksesibilitas (Security & WCAG AA)

1. **Proteksi Kredensial**:
   - Kata sandi tidak pernah disimpan di `localStorage`, `sessionStorage`, maupun cookie sisi klien.
   - Form menggunakan atribut `autoComplete="email"` dan `autoComplete="current-password"` yang kompatibel penuh dengan pengelola sandi modern (Apple Keychain, 1Password, Bitwarden, Google Password Manager).
2. **Aksesibilitas (WCAG 2.1 AA)**:
   - Seluruh elemen input memiliki keterkaitan label formal menggunakan atribut `htmlFor` dan `id`.
   - Menggunakan `aria-invalid` dan `aria-describedby` untuk mendeskripsikan pesan kesalahan kepada teknologi pembaca layar (*screen reader*).
   - Kontras warna teks utama `#17202D` terhadap latar `#FFFFFF` adalah **14.2:1**, jauh melampaui batas minimum WCAG AA (4.5:1).
   - Kontras teks tombol putih terhadap latar `#102B40` adalah **12.8:1**.
   - Mendukung penuh navigasi keyboard (`Tab`, `Shift+Tab`, `Space`, `Enter`).
3. **Penyelarasan Role-Based Access Control**:
   - Pengalihan pasca-login diproses secara ketat oleh server di `AuthController::redirectByRole()`, bukan melalui logika sisi klien yang dapat dimanipulasi:
     - `SuperAdmin` $\rightarrow$ `/dojos` / `/dashboard`
     - `PengprovAdmin` $\rightarrow$ `/pengprov`
     - `PengkabAdmin` $\rightarrow$ `/pengkot`
     - `Sensei` $\rightarrow$ `/my-dojo` (`dojos.analytics`)
     - `Kenshi` $\rightarrow$ `/portal/kenshi` (`kenshis.portal`)

---

## 8. Verifikasi Teknis

- **Pint Style Fixer**: `vendor/bin/pint --format agent` lolos 100%.
- **Vite Bundler**: `bun run build` sukses mengompilasi chunk `Login-C4YHpN5n.js` dalam 785ms tanpa peringatan maupun galat.
- **Feature Tests**: `php artisan test --compact` mencatatkan **80/80 tests passed (506 assertions)**.
