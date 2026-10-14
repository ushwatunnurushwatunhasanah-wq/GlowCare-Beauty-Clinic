# GlowCare Beauty Clinic
> *"Your Beauty, Our Care"* — Sistem Informasi & Manajemen Klinik Kecantikan Modern, Elegan, dan Terintegrasi.

---

## 🌸 Tentang Aplikasi

**GlowCare Beauty Clinic** dirancang khusus untuk operasional harian klinik estetika dan dermatologi profesional. Aplikasi ini menghubungkan seluruh alur pelayanan klinik dalam satu ekosistem:

```text
Pasien Datang
      ↓
Loket Mendaftarkan Pasien (Buat No. RM & No. Antrian)
      ↓
Pasien Menunggu di Ruang Tunggu Ber-AC
      ↓
Dokter Memanggil Pasien (Panggilan Audio Otomatis)
      ↓
Dokter Melakukan Pemeriksaan Kulit & Tindakan Treatment
      ↓
Hasil Perawatan Dicatat ke Rekam Medis (Timeline)
      ↓
Pasien Melakukan Pembayaran di Kasir (Cetak Struk Resmi)
      ↓
Treatment Selesai & Pasien Memberikan Rating 1-5 Bintang
      ↓
Admin Memoderasi Komentar & Menganalisis Laporan Omzet
```

---

## 🔑 Akun Demo Siap Pakai

Aplikasi telah dilengkapi dengan data realistis dan 3 akun demo:

| Peran (Role) | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Admin Utama** | `admin@glowcare.test` | `password` | Kendali penuh, laporan omzet, moderasi ulasan, audit log |
| **Dokter Spesialis** | `dokter@glowcare.test` | `password` | Pemeriksaan kulit, tindakan treatment, rekam medis timeline |
| **Loket Pendaftaran**| `loket@glowcare.test` | `password` | Pendaftaran pasien, nomor antrian, kasir & cetak struk |

*(Pada halaman login tersedia juga tombol **1-Klik Masuk** untuk pengujian instan).*

---

## 💻 Panduan Menjalankan di Docker Desktop (Windows)

Aplikasi ini telah dikonfigurasi penuh dengan multi-container Docker:
- **Frontend**: React 19 + Vite + Tailwind CSS (Port `3000`)
- **Backend API**: PHP 8.2-FPM (Laravel ready)
- **Web Server**: Nginx Alpine Reverse Proxy (Port `8000`)
- **Database**: MySQL 8.0 dengan **Persistent Volume** (Port `3306`)

### Langkah 1: Pasang Docker Desktop di Windows
1. Unduh dan pasang [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Pastikan fitur **WSL 2 backend** telah aktif di Docker Desktop.
3. Buka Docker Desktop dan pastikan ikon menunjukkan status *Engine Running*.

### Langkah 2: Buka Folder Project
Buka **PowerShell** atau **Command Prompt (CMD)**, lalu arahkan ke direktori project:
```bash
cd glowcare-beauty-clinic
```

### Langkah 3: Jalankan Docker Compose
Jalankan perintah berikut untuk membangun dan menyalakan seluruh container di latar belakang:
```bash
docker compose up -d --build
```

Container akan otomatis melakukan:
- Menyiapkan environment Node.js dan mengompilasi tampilan React + Vite.
- Menyiapkan PHP-FPM dan Nginx server.
- Menyiapkan database MySQL `glowcare_clinic` dan volume data persisten `glowcare_mysql_data`.
- Menjalankan migrasi tabel (`users`, `patients`, `doctors`, `treatments`, `queues`, `medical_records`, `payments`, `ratings`).
- Memasukkan data awal (seed demo accounts & sample clinic data).

### Langkah 4: Buka Aplikasi di Browser
Buka browser favorit Anda (Google Chrome, Edge, Safari):
- **Aplikasi Web**: [http://localhost:3000](http://localhost:3000)
- **Backend Nginx API**: [http://localhost:8000](http://localhost:8000)

### Langkah 5: Login Menggunakan Akun Demo
Gunakan salah satu kredensial demo di atas (misalnya `admin@glowcare.test` / `password`).

---

## 🛠️ Perintah Berguna Docker

* **Melihat status container aktif:**
  ```bash
  docker compose ps
  ```
* **Melihat log container secara langsung:**
  ```bash
  docker compose logs -f
  ```
* **Menghentikan container tanpa menghapus data database:**
  ```bash
  docker compose down
  ```
* **Masuk ke container MySQL:**
  ```bash
  docker exec -it glowcare_mysql mysql -u glowcare_user -pglowcare_secret glowcare_clinic
  ```

---

## 🌟 Fitur Utama Unggulan

1. **Dashboard Eksekutif**: Metrik KPI omzet hari ini, pasien menunggu, tren grafik bulanan, dan ulasan terbaru.
2. **Rekam Medis Dermatologi (Timeline)**: Dokumentasi keluhan, diagnosis kulit, tindakan laser/peeling, produk racikan, dan kontrol berkala.
3. **Papan Antrian Digital & Panggilan Suara**: Dilengkapi fitur Web Speech synthesizer bahasa Indonesia untuk memanggil nomor antrian ke ruang poli.
4. **Kasir & Cetak Struk Thermal**: Format struk mini 80mm resmi siap cetak ke printer thermal kasir (`Ctrl + P`).
5. **Survei Kepuasan Pasien & Moderasi Review**: Penilaian 7 aspek mutu pelayanan serta tombol setujui/sembunyikan/tindaklanjuti bagi admin.
6. **Ekspor Laporan**: Fitur unduh laporan Pasien, Omzet, Dokter, dan Mutu dalam format **Print**, **PDF**, dan **Excel (CSV)**.

---
© 2026 **GlowCare Beauty Clinic**. All rights reserved.
