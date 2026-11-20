# Dokumentasi Sistem Desain UI/UX & Perencanaan Teknis e-DOJO PERKEMI

> **Aplikasi**: e-DOJO — Sistem Manajemen Dojo & Kenshi PERKEMI Indonesia  
> **Standar Desain**: Enterprise Product Dashboard & Modern Japanese-Inspired Minimalist SaaS  
> **Status**: Selesai Diimplementasikan (Live) & Terverifikasi (Desktop 1440px + Mobile 390px)  
> **Rujukan Mockup**: Mockup Desktop (`media_1794810160319_8b4b417a.jpg`) dan Mockup Mobile (`media_1794810295903_ebd38dbf.jpg`).

---

## 1. Filosofi & Konsep Desain

Pengembangan antarmuka e-DOJO mengadopsi prinsip **Professional Enterprise Dashboard** yang berakar pada kedisiplinan dan kesederhanaan seni bela diri Shorinji Kempo (*Gōhō Jūhō, Shinshin Ichinyo*):

- **Clean & Minimalist Interface**: Antarmuka bersih tanpa dekorasi berlebihan. Mengutamakan data fungsional, keterbacaan tinggi, serta hierarki visual yang tegas.
- **Modern Japanese-Inspired Aesthetic**: Nuansa *Navy Blue* kokoh berpadu dengan aksen *Perkemi Red* dan tipografi berbobot medium-bold, menghadirkan nuansa kesungguhan budo tradisional dalam wujud produk SaaS modern.
- **Strict Anti-AI Slop**:
  - Tanpa gradient warna mencolok atau hero banner besar yang memboroskan ruang pandang.
  - Tanpa efek glassmorphism murahan atau bayangan (*drop shadow*) tebal.
  - Tidak menggunakan emoji sebagai ikon; seluruh ikonografi menggunakan format SVG konsisten dari Lucide Icons.
  - Spasi proporsional (*kelipatan 4px dan 8px*) dan radius sudut terukur (8–10px).

---

## 2. Design Tokens & Sistem Warna

| Token Desain | Nilai Heksadesimal | Peran & Penggunaan |
|---|---|---|
| **Sidebar Background** | `#102B40` | Warna solid *Dark Navy Blue* pada bilah sisi kiri desktop dan laci navigasi mobile. |
| **Sidebar Hover** | `#1A3B52` | Status hover item navigasi bilah sisi. |
| **Sidebar Active** | `#24475E` | Status aktif item navigasi, dipadukan dengan garis aksen merah. |
| **Primary Red** | `#C51C2A` | Aksen resmi PERKEMI: indikator navigasi aktif, logo badge, link aksi penting, serta indikator sorotan. |
| **Canvas Background** | `#F8F9FA` | Latar belakang halaman aplikasi yang ramah di mata (*neutral off-white*). |
| **Card Background** | `#FFFFFF` | Latar belakang kartu statistik, panel data, dan tabel. |
| **Primary Text** | `#17202D` | Warna teks utama, judul metrik, dan nama atlet dengan kontras tinggi. |
| **Secondary Text** | `#718092` | Keterangan pembantu, sub-judul, breadcrumb, dan label metadata. |
| **Border / Divider** | `#E8EBEF` | Garis batas 1px pada kartu, pemisah tabel, dan garis pembagi header. |
| **Success Emerald** | `#16865C` | Status `Aktif`, tren positif `+31%`, dan lencana kelulusan UKT. |

### Tipografi & Skala Teks
- **Keluarga Font**: `Inter, sans-serif` (didukung oleh Bunny Fonts dan fallback sistem operasi).
- **Heading**:
  - H1 Judul Halaman: `text-xl lg:text-2xl font-bold text-[#17202D] tracking-tight`
  - H2 Judul Seksi Kartu: `text-sm font-bold text-[#17202D]`
  - H3 Judul Widget: `text-xs font-bold text-[#17202D]`
- **Body & Data**:
  - Teks Kartu & Tabel: `text-xs regular/medium`
  - Angka Metrik: `text-2xl lg:text-3xl font-extrabold font-mono text-[#17202D]`
  - Label Sekunder: `text-[10px]` atau `text-[11px] text-[#718092]`

---

## 3. Spesifikasi Tata Letak Desktop (1440px)

```
+---------------------------------------------------------------------------------------------------------------+
| SIDEBAR (#102B40)      | TOPBAR: Home / Pusat Komando / Ikhtisar Nasional  | Periode: 2026 | Bell | Avatar PB |
| [Shield] e-DOJO PERKEMI+---------------------------------------------------------------------------------------+
|                        | [ | ] Ikhtisar Nasional                                                              |
| IKHTISAR               | Pemantauan keanggotaan dan aktivitas dojo Perkemi.                                   |
| > Ikhtisar Nasional    +--------------------+--------------------+--------------------+--------------------+
|   Analitik & Tren      | Dojo Terdaftar     | Kenshi Aktif       | Yudansha           | Mudansha           |
| ORGANISASI             | 29   ↑+31%         | 18   ↑+20%         | 11   ↑+61%         | 7    ↑+17%         |
|   Daftar Cabang Dojo   +--------------------+--------------------+--------------------+--------------------+
|   Pengurus Perkemi     | KOLOM KIRI (8 Kolom)                                 | KOLOM KANAN (4 Kolom)          |
| KENSHI & PELATIH       | +--------------------------------------------------+ | +----------------------------+ |
|   Data Kenshi          | | Distribusi Kemahiran & Tingkatan Sabuk (Kempo)   | | | Agenda Mendatang           | |
|   Data Pelatih & Sensei| | [============][======][====][====]               | | | 14-17 Nov: Gashuku & UKT   | |
| KTA & UKT              | | Dan (11)  Coklat (3)  Hijau (2)  Kuning/Putih (2)| | | 05-08 Des: Kejurnas        | |
|   KTA Digital Kenshi   | +--------------------------------------------------+ | +----------------------------+ |
|   UKT                  | | Kenshi Terbaru               Pangkalan Kenshi -> | | | Ringkasan Wilayah        | |
| KEHADIRAN              | | 1. M. Rafi Wiransyah Putra • III Dan • Aktif     | | | Jawa Timur  29 Dojo|18 Kenshi|
|   Presensi & Kehadiran | | 2. M. Sjaaf, S.H.,M.M.    • III Dan • Aktif     | | +----------------------------+ |
| KEUANGAN               | | 3. Dr. Ir. Siswoyo, MT    • III Dan • Aktif     | | | Aktivitas Sistem & Audit   | |
|   Finance & Accounting | | 4. Esa Jati Wicaksono     • III Dan • Aktif     | | | 1 jam lalu | created | PB  | |
| PENGATURAN             | | 5. Agung Purwantoro       • III Dan • Aktif     | | +----------------------------+ |
| PB Perkemi © 2026 v1.0 | +--------------------------------------------------+ |                                |
+------------------------+--------------------------------------------------------------------------------------+
```

### Rincian Komponen Desktop:
1. **Bilah Sisi Kiri (Sidebar Desktop)**:
   - Lebar tetap `w-64`, warna `#102B40`, batas border `#1A3B52`.
   - Header: Lambang perisai merah (`#C51C2A`) dengan teks `e-DOJO` dan `PERKEMI INDONESIA`.
   - Navigasi terkategori: `IKHTISAR`, `ORGANISASI`, `KENSHI & PELATIH`, `KTA & UKT`, `KEHADIRAN`, `KEUANGAN`, `LAPORAN`, dan `PENGATURAN`.
   - Item aktif: Latar belakang `#24475E`, teks putih tebal, dan pita indikator merah `#C51C2A` di sisi kiri.
   - Footer: Hak cipta `PB Perkemi © 2026` dan lencana versi `v1.0.0`.
2. **Top Header**:
   - Breadcrumb terintegrasi: `Pusat Komando / Ikhtisar Nasional`.
   - Pemilih periode interaktif: Tombol dropdown `Tahun 2026`.
   - Ikon lonceng notifikasi dengan titik penanda merah (*unread badge*).
   - Profil pengguna: Avatar inisial `PB`, nama `Pengurus Besar Perkemi`, dan jabatan `SuperAdmin`.
3. **4 Kartu Metrik Utama**:
   - Disusun dalam grid 4 kolom sejajar dengan kartu berbatas `1px #E8EBEF` dan radius `12px`.
   - Ikon masing-masing metrik diwarnai khusus (Merah, Biru, Amber, Nila) dalam kontainer halus `rounded-lg`.
   - Angka statistik ditampilkan dengan font monospace tebal dan persentase kenaikan berwarna hijau `#16865C` atau amber.
4. **Distribusi Kemahiran & Tingkatan Sabuk (Kempo Belt Ranks)**:
   - Bilah persentase segmented yang merepresentasikan proporsi tingkatan kenshi nasional:
     - **Dan (Yudansha)**: `#102B40` (61% - 11 Kenshi)
     - **Sabuk Coklat (Kyu 1–3)**: `#8B4513` (17% - 3 Kenshi)
     - **Sabuk Hijau / Biru (Kyu 4–6)**: `#10B981` (11% - 2 Kenshi)
     - **Sabuk Kuning / Putih (Minarai)**: `#F59E0B` (11% - 2 Kenshi)
   - Dilengkapi tombol pemfilteran wilayah `Nasional`.
5. **Tabel Kenshi Terbaru**:
   - Memuat 5 kenshi terdaftar paling anyar dengan kolom `No.`, `Nama Kenshi`, `NRA / Asal Dojo`, `Tingkat`, dan `Status`.
   - Status anggota ditandai dengan pill badge hijau emerald `● Aktif`.
   - Tombol tautan cepat `Pangkalan Kenshi →` yang mengarah langsung ke master direktori `/kenshis`.
6. **Panel Sisi Kanan (Widgets)**:
   - **Agenda Mendatang**: 3 agenda nasional terdekat lengkap dengan tanggal tebal, judul kegiatan, dan ikon penanda lokasi `MapPin`.
   - **Ringkasan Wilayah**: Rekapitulasi cabang aktif di Pengprov Jawa Timur (29 Dojo, 18 Kenshi) dengan pemisah garis vertikal bersih.
   - **Aktivitas Sistem & Audit Trail**: 5 entri riwayat mutasi dari Spatie ActivityLog (`created`, `updated`) oleh Sistem Perkemi dengan tautan `Lihat Log →`.

---

## 4. Spesifikasi Tata Letak Mobile (375–430px)

### Tampilan Layar Utama Mobile
- **Header Ringkas (56px)**:
  - Tombol hamburger kiri untuk membuka drawer navigasi.
  - Logo `e-DOJO PERKEMI INDONESIA`.
  - Ikon notifikasi lonceng dan avatar `PB`.
- **Grid Metrik 2 Kolom**:
  - Kartu statistik beradaptasi menjadi grid `2x2`: `Dojo Terdaftar` & `Kenshi Aktif` di baris atas, `Yudansha` & `Mudansha` di baris bawah.
- **Kartu Distribusi Sabuk Responsif**:
  - Bilah segmentasi menyesuaikan lebar layar ponsel dengan legenda 4 kolom yang proporsional.
- **Tabel Kenshi Compact**:
  - Kolom `NRA / Asal Dojo` otomatis disembunyikan pada layar sempit (`hidden sm:table-cell`), menyisakan `No.`, `Nama Kenshi`, `Tingkat (III Dan)`, dan `Status (Aktif)`.
- **Bottom Navigation Bar (Bilah Bawah Tetap)**:
  - Selalu tersemat di bagian bawah layar ponsel (`fixed bottom-0 z-30`).
  - Memuat 5 menu utama:
    1. **Beranda** (`Home`) — Aktif berwarna merah `#C51C2A`.
    2. **Kehadiran** (`CalendarCheck`) — Akses presensi selfie & geotag.
    3. **Kenshi** (`Users`) — Direktori anggota dojo.
    4. **KTA & UKT** (`Award`) — Kartu digital & pendaftaran ujian.
    5. **Laporan** (`BarChart3`) — Ringkasan rekapitulasi data.

### Tampilan Drawer Navigasi Mobile (Bilah Sisi Terbuka)
- Membuka dari kiri dengan transisi geser mulus (*smooth slide-out*).
- Dilengkapi lapisan backdrop semi-transparan gelap (`bg-slate-900/60 backdrop-blur-xs`).
- Warna latar bilah sisi tetap konsisten `#102B40`.
- Footer laci memuat kartu identitas pengguna:
  - Avatar lingkaran `PB`.
  - Nama akun `PB Perkemi` dan peran `SuperAdmin`.
  - Lencana versi `v1.0.0`.

---

## 5. Pemetaan Modul & Hierarki Hak Akses Sesuai URL

| URL Prefix | Pemilik Akses | Fitur Spesifik yang Tersedia |
|---|---|---|
| `/dashboard` | **SuperAdmin (PB Perkemi)** | Pusat komando nasional, metrik 38 Pengprov, panel persetujuan tarif iuran dojo (`pending_pb` $\rightarrow$ `approved`), rekapitulasi setoran Yudansha 100%, admission fee WSKO, dan audit log Spatie. |
| `/pengprov` | **Pengurus Provinsi** | Monitoring cabang dojo se-provinsi, hak alokasi iuran 10% Pengprov, pengesahan UKT Dan tingkat daerah, dan pengawasan serapan kurikulum materi di dojo bawahannya. |
| `/pengkot` | **Pengurus Kota / Kab** | Monitoring atlet & dojo binaan kota/kabupaten, hak alokasi iuran 10% Pengkot, validasi syarat administrasi Porprov/Kejurda, dan penyelenggaraan UKT tingkat Mudansha (Kyu 6 s.d. Kyu 1). |
| `/dojo` | **Pengurus & Pelatih Dojo** | **Pengaturan Tarif (`/dojo/settings/iuran`)**: Pengajuan nominal Kyukenshi >Rp50k.<br>**Kas Dojo (`/dojo/iuran`)**: Hak dana dojo 20% & hak pelatih dojo 40%.<br>**Materi Dojo (`/dojo/materi`)**: Unggah video drill latihan dojo.<br>**Jadwal Latihan (`/schedules`)**: Pengaturan batch geofencing. |
| `/portal/kenshi` | **Kenshi (Siswa / Atlet)** | **KTA Digital**: Barcode verifikasi SHA-256.<br>**Materi Pembelajaran (`/portal/kenshi/materi`)**: Akses video drill & PDF Dokuhon/Kamoku sesuai gating sabuk.<br>**Iuran Anggota (`/portal/kenshi/iuran`)**: Riwayat invoice, setoran, dan status lunas.<br>**Pendaftaran UKT (`/portal/kenshi/ukt`)**: Indikator 5 kelayakan ujian mandiri. |

---

## 6. Verifikasi & Integritas Kode

- **Pint Formatting**: Sesuai dengan standar Laravel Pint (`vendor/bin/pint --format agent`).
- **Feature & Unit Tests**: **75 passed (487 assertions)** tanpa kegagalan.
- **Frontend Build**: Vite bundling React 19 + TypeScript + Tailwind CSS v4 berhasil 100% tanpa kompilasi galat (`bun run build`).
