# Project Overview — class-rpl-1-202627

> **Web Kelas RPL 1** — Rumah digital kelas RPL 1 tahun ajaran 2026/2027.

---

## Daftar Isi

1. [Tujuan & Latar Belakang](#1-tujuan--latar-belakang)
2. [Tech Stack](#2-tech-stack)
3. [Fitur Utama](#3-fitur-utama)
4. [Peran Pengguna & User Story](#4-peran-pengguna--user-story)
5. [User Flow](#5-user-flow)
6. [Project Flow (Technical)](#6-project-flow-technical)
7. [Arsitektur Sistem](#7-arsitektur-sistem)
8. [Data Model](#8-data-model)
9. [Server Actions (Mutation API)](#9-server-actions-mutation-api)
10. [HTTP Endpoints (API Routes)](#10-http-endpoints-api-routes)
11. [Struktur Halaman (App Router)](#11-struktur-halaman-app-router)
12. [Autentikasi & Otorisasi](#12-autentikasi--otorisasi)
13. [Storage & File Upload](#13-storage--file-upload)
14. [Desain Visual](#14-desain-visual)
15. [Variabel Lingkungan](#15-variabel-lingkungan)
16. [Testing](#16-testing)
17. [Deployment](#17-deployment)
18. [Error Handling & Pesan Error](#18-error-handling--pesan-error)
19. [Validation Rules per Domain](#19-validation-rules-per-domain)
20. [Entity Relationship Diagram (ERD)](#20-entity-relationship-diagram-erd)
21. [Audit Trail & Database Triggers](#21-audit-trail--database-triggers)
22. [Local Development Setup](#22-local-development-setup)
23. [Coding Conventions & File Structure Guide](#23-coding-conventions--file-structure-guide)
24. [Known Limitations & Gotchas](#24-known-limitations--gotchas)
25. [Performance & Optimization Guide](#25-performance--optimization-guide)
26. [Decision Log](#26-decision-log)
23. [Coding Conventions & File Structure Guide](#23-coding-conventions--file-structure-guide)
24. [Known Limitations & Gotchas](#24-known-limitations--gotchas)

---

## 1. Tujuan & Latar Belakang

Web ini bukan sekadar sistem manajemen kelas — ini adalah **rumah digital kelas RPL 1**.

Tujuan utama, dari yang paling penting:

| Prioritas | Tujuan |
|-----------|--------|
| 1 | **Mengabadikan kenangan kebersamaan** — galeri foto kegiatan dan momen kelas |
| 2 | **Transparansi kas kelas** — semua warga kelas dapat melihat kondisi keuangan secara jelas |
| 3 | **Koordinasi akademik harian** — jadwal pelajaran dan pengumuman yang mudah diakses dari HP |
| 4 | **Ruang diskusi bersama** — forum untuk bertanya, berbagi, dan belajar bersama |
| 5 | **Rekam jejak kehadiran** — presensi digital sebagai bukti kebersamaan yang terdokumentasi |

---

## 2. Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Next.js App Router | 16.3.0 |
| Bahasa | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Database | Supabase PostgreSQL | hosted |
| ORM | Prisma | 7.9.x |
| Storage File/Gambar | Cloudinary | 2.x |
| Autentikasi | Supabase Auth + `@supabase/ssr` | 0.12.x |
| Validasi | Zod | 4.x |
| Ikon | lucide-react | 1.x |
| Testing | Vitest + fast-check (PBT) | 2.x / 4.x |
| Deploy | Vercel + Supabase | free tier |

---

## 3. Fitur Utama

### ✅ Sudah Selesai (v1)

| # | Modul | Nama Fitur | Deskripsi Singkat |
|---|-------|------------|-------------------|
| 1 | `auth` | Autentikasi | Login email/password, login Google OAuth, registrasi, logout |
| 2 | `galeri` | Galeri Foto | Album foto per event, upload foto, hapus foto, hapus album |
| 3 | `jadwal` | Jadwal Kelas | Grid jadwal Senin–Jumat, CRUD slot jadwal (admin) |
| 4 | `kas` | Iuran Siswa | Periode iuran, rekam pembayaran per siswa, upload bukti bayar |
| 5 | `kas` | Transaksi Kas Umum | Catat pemasukan/pengeluaran kelas (non-iuran) |
| 6 | `pengumuman` | Pengumuman | CRUD pengumuman, sistem draft/publish |
| 7 | `presensi` | Presensi | Rekam kehadiran harian, statistik kehadiran |
| 8 | `materi` | Materi Pelajaran | Upload file (PDF/PPT/DOCX/gambar) atau link eksternal |
| 9 | `forum` | Forum Diskusi | Buat post, komentar, tandai jawaban terbaik, moderasi |
| 10 | `profil` | Profil Pengguna | Update nama & avatar |
| 11 | DB | Audit Trail | Log otomatis perubahan data kas via database trigger |

### 🔄 Rencana Pengembangan
- Badge "belum bayar kas" di halaman utama
- Search/filter di galeri dan pengumuman
- Export kas ke PDF
- Grafik statistik kas

---

## 4. Peran Pengguna & User Story

### Daftar Peran

| Role | Deskripsi |
|------|-----------|
| `murid` | Siswa kelas (default). Akses baca semua konten, aksi terbatas |
| `bendahara` | Ketua/sekretaris keuangan. Bisa kelola kas, galeri, materi |
| `admin` | Wali kelas/ketua kelas. Akses penuh ke semua fitur |

---

### User Stories per Modul

#### Autentikasi
- Sebagai pengguna baru, saya ingin mendaftar dengan email & password agar bisa mengakses web kelas.
- Sebagai pengguna, saya ingin login dengan akun Google agar tidak perlu menghafal password baru.
- Sebagai pengguna yang sudah login, saya ingin logout dengan aman agar sesi saya tidak bisa diakses orang lain.

#### Galeri Foto
- Sebagai **murid**, saya ingin melihat galeri foto kegiatan kelas agar bisa menikmati kenangan bersama.
- Sebagai **admin/bendahara**, saya ingin membuat album baru untuk setiap event agar foto terorganisir.
- Sebagai **admin/bendahara**, saya ingin upload foto ke album agar koleksi kenangan kelas bertambah.
- Sebagai **admin/bendahara**, saya ingin menghapus foto atau seluruh album jika ada yang tidak sesuai.

#### Jadwal Kelas
- Sebagai **murid**, saya ingin melihat jadwal pelajaran hari ini agar tahu mata pelajaran yang akan berlangsung.
- Sebagai **admin**, saya ingin menambah/mengubah slot jadwal agar jadwal selalu up-to-date.
- Sebagai **admin**, saya ingin menghapus slot jadwal yang sudah tidak berlaku.

#### Kas Kelas
- Sebagai **murid**, saya ingin melihat status iuran saya agar tahu apakah saya sudah lunas atau belum.
- Sebagai **bendahara/admin**, saya ingin membuat periode iuran baru agar proses tagihan terdokumentasi.
- Sebagai **bendahara/admin**, saya ingin mencatat pembayaran siswa dan upload bukti transfer agar data keuangan akurat.
- Sebagai **bendahara/admin**, saya ingin mencatat pemasukan/pengeluaran kas kelas agar transparansi keuangan terjaga.
- Sebagai **bendahara/admin**, saya ingin melihat ringkasan iuran seluruh siswa (siapa yang sudah/belum bayar).

#### Pengumuman
- Sebagai **murid**, saya ingin melihat pengumuman yang sudah dipublish agar tidak ketinggalan informasi penting.
- Sebagai **admin/bendahara**, saya ingin membuat pengumuman dengan status draft dulu sebelum dipublish.
- Sebagai **admin/bendahara**, saya ingin mempublish pengumuman agar dapat dibaca semua anggota kelas.
- Sebagai **admin/bendahara**, saya ingin mengedit atau menghapus pengumuman jika ada informasi yang salah.

#### Presensi
- Sebagai **murid**, saya ingin mencatat kehadiran saya sendiri agar presensi harian tercatat.
- Sebagai **admin/bendahara**, saya ingin mencatat kehadiran untuk semua siswa agar data presensi lengkap.
- Sebagai **admin/bendahara**, saya ingin melihat statistik kehadiran harian (jumlah hadir, persentase) untuk monitoring kelas.

#### Materi Pelajaran
- Sebagai **murid**, saya ingin melihat dan mendownload materi pelajaran agar mudah belajar.
- Sebagai **admin/bendahara**, saya ingin upload file materi (PDF, PPT, DOCX) atau tambahkan link eksternal agar materi mudah diakses.
- Sebagai **admin/bendahara**, saya ingin menghapus materi yang sudah tidak relevan.

#### Forum Diskusi
- Sebagai **murid**, saya ingin membuat post pertanyaan agar bisa mendapat bantuan dari teman atau pengajar.
- Sebagai **murid**, saya ingin membalas post orang lain agar bisa membantu teman yang kesulitan.
- Sebagai **admin/bendahara**, saya ingin menandai komentar sebagai "jawaban terbaik" agar diskusi lebih terarah.
- Sebagai penulis post/komentar atau admin, saya ingin menghapus post/komentar milik saya.

#### Profil
- Sebagai pengguna, saya ingin mengubah nama tampilan saya agar profil terlihat sesuai identitas saya.
- Sebagai pengguna, saya ingin mengganti foto avatar saya agar profil lebih personal.

---

## 5. User Flow

User flow menggambarkan perjalanan setiap jenis pengguna dari masuk ke web hingga menyelesaikan aksi tertentu.

---

### 5.1 Flow Autentikasi

#### Login dengan Email/Password
```
Pengguna buka web
  │
  ├─ Sudah punya session? ──Yes──► Redirect ke /  (atau /dashboard jika admin/bendahara)
  │
  No
  │
  ▼
/login — Isi email & password
  │
  ├─ Validasi client-side (Zod) gagal? ──► Tampilkan pesan error di bawah field
  │
  ▼
signInWithEmail() dipanggil
  │
  ├─ Supabase error (email salah / password salah)? ──► "Email atau kata sandi tidak sesuai."
  ├─ Email belum dikonfirmasi? ──────────────────────► "Periksa email Anda..."
  │
  ▼
Login berhasil → redirect ke /  (murid)
                              atau /dashboard  (admin/bendahara)
```

#### Login dengan Google OAuth
```
Pengguna klik "Masuk dengan Google"
  │
  ▼
signInWithGoogle() → Supabase menghasilkan URL OAuth
  │
  ▼
Browser diarahkan ke halaman consent Google
  │
  ├─ User menolak / provider error? ──► /login?error=auth_failed
  │
  ▼
Google redirect ke /api/auth/callback?code=...
  │
  ▼
handleAuthCallback():
  1. exchangeCodeForSession() → dapat session & userId
  2. Cek role di public.users
  │
  ├─ role = admin / bendahara ──► /dashboard
  └─ role = murid / belum ada row ──► /
```

#### Registrasi
```
/login → klik "Daftar"
  │
  ▼
Isi: nama, email, password, konfirmasi password
  │
  ├─ Password ≠ konfirmasi? ──► "Konfirmasi kata sandi tidak sama."
  │
  ▼
signUpWithEmail()
  │
  ├─ Ada session langsung? ──► redirect ke /  (signed_in)
  └─ Tidak ada session? ────► Tampilkan "Cek email konfirmasi" (confirmation_required)
       │
       ▼
     User klik link di email konfirmasi
       │
       ▼
     /api/auth/callback → session aktif → redirect ke /
```

---

### 5.2 Flow per Fitur

#### Galeri Foto — Murid
```
/galeri
  │
  ▼
Lihat daftar album (judul, tanggal event, jumlah foto)
  │
  ▼
Klik album
  │
  ▼
Lihat grid foto dalam album
  │
  ▼
Klik foto → lightbox / tampilan penuh
```

#### Galeri Foto — Admin/Bendahara
```
/admin/galeri
  │
  ▼
Lihat semua album + tombol "Buat Album Baru"
  │
  ├─ Buat Album
  │    │
  │    ▼
  │   Isi judul, deskripsi, tanggal event
  │    │
  │    ▼
  │   createGallery() → album muncul di daftar
  │
  ├─ Upload Foto
  │    │
  │    ▼
  │   Pilih album → klik Upload
  │    │
  │    ▼
  │   Pilih file gambar (JPEG/PNG/WebP)
  │    │
  │    ▼
  │   uploadPhoto() → Cloudinary upload → simpan ke DB
  │    │
  │    ├─ Gagal upload? ──► Tampilkan error, foto tidak tersimpan
  │    └─ Berhasil? ──────► Foto muncul di album
  │
  └─ Hapus Album
       │
       ▼
      deleteGallery() → hapus semua foto dari Cloudinary → hapus record DB
```

#### Kas — Iuran Siswa — Murid
```
/kas
  │
  ▼
Lihat daftar periode iuran
  │
  ▼
Lihat status per periode: LUNAS (hijau) / PENDING (kuning)
  │
  ▼
Klik periode untuk detail (nominal, tanggal, bukti bayar jika ada)
```

#### Kas — Bendahara/Admin
```
/admin/kas
  │
  ├─ Buat Periode Iuran
  │    │
  │    ▼
  │   Isi: nama, nominal (Rp), tanggal mulai, tanggal akhir
  │    │
  │    ▼
  │   createDuesPeriod()
  │    ├─ Nama duplikat? ──► "Periode iuran dengan nama tersebut sudah ada."
  │    └─ Berhasil? ──────► Periode muncul di daftar, semua siswa otomatis pending
  │
  ├─ Tandai Lunas
  │    │
  │    ▼
  │   Cari siswa di tabel iuran → klik "Tandai Lunas"
  │    │
  │    ▼
  │   (Opsional) Upload bukti transfer → validasi MIME + ukuran
  │    │
  │    ▼
  │   markPaymentPaid() → update status = "paid", simpan bukti ke Cloudinary
  │    ├─ Sudah lunas? ──► "Pembayaran ini sudah tercatat sebagai lunas."
  │    └─ Berhasil? ────► Status berubah menjadi LUNAS
  │
  ├─ Catat Transaksi Kas Umum
  │    │
  │    ▼
  │   Isi: judul, nominal, tipe (INCOME/EXPENSE), kategori, deskripsi
  │    │
  │    ▼
  │   createCashTransaction() → transaksi tercatat
  │
  └─ Lihat Ringkasan Iuran
       │
       ▼
      getDuesSummary() → tabel: nama siswa, periode, status, tanggal bayar
```

#### Pengumuman — Admin/Bendahara
```
/admin/pengumuman
  │
  ├─ Buat Pengumuman (draft)
  │    │
  │    ▼
  │   Isi judul & konten → createAnnouncement()
  │    │
  │    ▼
  │   Pengumuman tersimpan sebagai DRAFT (tidak terlihat murid)
  │
  ├─ Publish
  │    │
  │    ▼
  │   Klik "Publish" → publishAnnouncement()
  │    │
  │    ▼
  │   Status berubah PUBLISHED → murid dapat melihat
  │
  └─ Edit / Hapus
       │
       ▼
      updateAnnouncement() atau deleteAnnouncement()
       (hanya author, admin, atau bendahara)
```

#### Pengumuman — Murid
```
/pengumuman
  │
  ▼
Lihat daftar pengumuman yang sudah PUBLISHED
(pengumuman DRAFT tidak tampil)
  │
  ▼
Klik pengumuman → lihat konten lengkap
```

#### Presensi — Murid
```
/presensi
  │
  ▼
Pilih tanggal (default: hari ini)
  │
  ▼
Pilih status: HADIR / IZIN / SAKIT / ALFA
  │
  ▼
recordAttendance({ studentId: user.id, date, status })
  │
  ├─ studentId ≠ user.id? ──► "Akses ditolak." (enforcement di server)
  └─ Berhasil? ────────────► Status tercatat, checkInTime diisi jika HADIR
```

#### Presensi — Admin/Bendahara
```
/admin/presensi
  │
  ▼
Pilih tanggal
  │
  ▼
Lihat daftar semua siswa
  │
  ▼
Input status per siswa → recordAttendance() (boleh untuk semua studentId)
  │
  ▼
getAttendanceStats(date) → tampilkan: total siswa, hadir, persentase kehadiran
```

#### Materi — Admin/Bendahara
```
/admin/materi
  │
  ├─ Upload File
  │    │
  │    ▼
  │   Isi: judul, mata pelajaran, deskripsi
  │   Pilih file (PDF/PPT/DOCX/gambar, maks 10 MB)
  │    │
  │    ▼
  │   createMaterial() → validasi MIME → upload Cloudinary → simpan DB
  │    ├─ Format tidak didukung? ──► "Format file tidak didukung."
  │    ├─ Terlalu besar? ─────────► "Ukuran file maksimal 10 MB."
  │    └─ Berhasil? ─────────────► Materi muncul di daftar
  │
  └─ Tambah Link Eksternal
       │
       ▼
      Isi URL eksternal (YouTube, Google Drive, dll)
       │
       ▼
      createMaterial() tanpa fileBuffer → simpan externalLink ke DB
```

#### Forum Diskusi
```
/forum
  │
  ├─ Buat Post (semua role)
  │    │
  │    ▼
  │   Isi judul & konten → createPost()
  │    │
  │    ▼
  │   Post muncul di daftar, terurut dari terbaru
  │
  ├─ Balas / Komentar (semua role)
  │    │
  │    ▼
  │   Klik post → lihat detail & daftar komentar
  │   Tulis komentar → createComment({ postId, content })
  │
  ├─ Tandai Jawaban (admin/bendahara)
  │    │
  │    ▼
  │   Klik "Tandai sebagai Jawaban" pada komentar
  │    │
  │    ▼
  │   markCommentAsAnswer() → atomik: clear semua isAnswer, set target = true
  │
  └─ Hapus Post/Komentar
       │
       ▼
      deletePost() / deleteComment()
      (hanya author, admin, atau bendahara)
```

#### Profil
```
/profil
  │
  ▼
Lihat nama, email, role, avatar saat ini
  │
  ├─ Ganti Nama
  │    │
  │    ▼
  │   Edit nama → updateProfile({ name })
  │
  └─ Ganti Avatar
       │
       ▼
      Pilih file gambar → updateProfile({ name }, avatarBuffer)
       │
       ▼
      Upload ke Cloudinary → simpan URL baru ke public.users
      (role TIDAK bisa diubah melalui form ini)
```

---

### 5.3 Flow Navigasi Berdasarkan Role

```
Setelah Login Berhasil:
  │
  ├─ role = "admin" atau "bendahara"
  │    │
  │    ▼
  │   /dashboard  (overview stats kelas)
  │    │
  │    ├─► /admin/kas       — kelola iuran & transaksi
  │    ├─► /admin/galeri    — kelola album & foto
  │    ├─► /admin/jadwal    — atur jadwal pelajaran
  │    ├─► /admin/pengumuman — buat & publish pengumuman
  │    ├─► /admin/presensi  — rekap & input presensi
  │    ├─► /admin/materi    — upload materi
  │    └─► /admin/forum     — moderasi forum
  │
  └─ role = "murid"
       │
       ▼
      /  (halaman beranda)
       │
       ├─► /galeri      — lihat foto kenangan
       ├─► /jadwal      — cek jadwal hari ini
       ├─► /kas         — cek status iuran pribadi
       ├─► /pengumuman  — baca pengumuman
       ├─► /presensi    — catat kehadiran sendiri
       ├─► /materi      — download materi pelajaran
       ├─► /forum       — diskusi & tanya jawab
       └─► /profil      — edit nama & avatar
```

---

## 6. Project Flow (Technical)

Project flow menggambarkan bagaimana request diproses secara teknis dari browser hingga database, dan bagaimana komponen-komponen sistem saling berinteraksi.

---

### 6.1 Request Lifecycle — Setiap HTTP Request

```
Browser kirim request ke Vercel
  │
  ▼
middleware.ts (berjalan di SETIAP request)
  │
  ▼
updateSession(request)
  ├─ Baca cookie Supabase → cek session
  ├─ Jika session valid: refresh token jika mendekati expire → lanjut
  └─ Jika tidak ada session & route butuh auth → redirect /login
  │
  ▼
Next.js App Router routing
  │
  ├─ Route = page → Server Component (page.tsx)
  │    │
  │    ▼
  │   Server Component render:
  │   await prisma.model.findMany()
  │    │
  │    ▼
  │   Return HTML ke browser (zero client JS untuk read)
  │
  └─ Route = /api/* → Route Handler
       │
       ▼
      Handler function dieksekusi di server
```

---

### 6.2 Write Flow — Server Action (Semua Mutasi Data)

```
Client Component
  │
  ├─ User submit form / klik tombol
  ▼
[Client-side] Zod.safeParse(input)
  ├─ Gagal? → Tampilkan error di bawah field (tidak kirim ke server)
  │
  ▼
[Client] Panggil Server Action (Next.js RPC via HTTP POST)
  │
  ▼
[Server] Server Action:
  │
  ▼
  Step 1: requireAuth()
    ├─ Buat Supabase client (baca cookie)
    ├─ supabase.auth.getUser() → dapat userId
    ├─ prisma.user.findUnique({ id: userId }) → dapat CurrentUser (name, role, dll)
    └─ Jika gagal → return { success: false, error: "Sesi tidak valid." }
  │
  ▼
  Step 2: requireRole(user, ['admin', 'bendahara'])  (jika diperlukan)
    └─ Jika role tidak cocok → return { success: false, error: "Akses ditolak." }
  │
  ▼
  Step 3: Zod.safeParse(input)  (validasi ulang di server)
    └─ Jika gagal → return { success: false, error: "..." }
  │
  ▼
  Step 4: (Jika ada file) Upload ke Cloudinary
    ├─ Validasi MIME type & ukuran
    ├─ uploadToCloudinary(buffer, folder)
    └─ Jika gagal → return { success: false, error: "..." } (DB TIDAK disentuh)
  │
  ▼
  Step 5: Prisma operation (create / update / delete / upsert)
    └─ Jika gagal → return { success: false, error: formatError(err) }
  │
  ▼
  Step 6: revalidatePath('/path')  → invalidasi cache Next.js
  │
  ▼
  Return: { success: true, data: T }
  │
  ▼
[Client] Terima ActionResult<T>
  ├─ success: true  → update UI (toast sukses, tutup modal, refresh data)
  └─ success: false → tampilkan pesan error kepada user
```

---

### 6.3 Auth Flow — Supabase Session Lifecycle

```
Login berhasil
  │
  ▼
Supabase Auth set HttpOnly cookie di browser
(access_token + refresh_token)
  │
  ▼
Setiap request selanjutnya:
  │
  ▼
middleware.ts → updateSession()
  ├─ Baca access_token dari cookie
  ├─ Jika mendekati expire → auto-refresh menggunakan refresh_token
  └─ Set cookie baru dengan token yang diperbaharui
  │
  ▼
Server Component / Server Action:
  │
  createClient() → supabase.auth.getUser()
  │
  ▼
requireAuth() di guards.ts:
  ├─ getUser() → userId valid
  ├─ prisma.user.findUnique({ id: userId }) → CurrentUser
  └─ Return { ok: true, user: CurrentUser }
```

---

### 6.4 OAuth Callback Flow (Google)

```
[Browser] signInWithGoogle() → dapat URL OAuth dari Supabase
  │
  ▼
Browser redirect ke Google consent page
  │
  ▼
User setuju → Google redirect ke:
/api/auth/callback?code=AUTHORIZATION_CODE
  │
  ▼
handleAuthCallback():
  │
  ├─ Ada ?error= param? ──► redirect /login?error=auth_failed
  ├─ Tidak ada ?code=? ───► redirect /login?error=auth_failed
  │
  ▼
supabase.auth.exchangeCodeForSession(code)
  ├─ Gagal? ──► redirect /login?error=auth_failed
  │
  ▼
Dapat userId dari session
  │
  ▼
prisma.user.findUnique({ id: userId, select: { role } })
  │
  ├─ role = "admin" / "bendahara" ──► redirect /dashboard
  └─ role = "murid" / tidak ada ───► redirect /
```

---

### 6.5 File Upload Flow (Atomic Pattern)

```
Server Action dipanggil dengan fileBuffer
  │
  ▼
Validasi MIME type
  └─ Tidak didukung? → return error (Cloudinary TIDAK disentuh)
  │
  ▼
Validasi ukuran file
  └─ Terlalu besar? → return error (Cloudinary TIDAK disentuh)
  │
  ▼
uploadToCloudinary(buffer, folder)
  ├─ Upload gagal? → return error (DB TIDAK disentuh)
  └─ Berhasil → dapat { url, publicId }
  │
  ▼
prisma.model.create({ data: { ..., cloudinaryUrl: url, cloudinaryId: publicId } })
  ├─ DB gagal? → log error, return error
  │             (Cloudinary asset orphan — dilog untuk manual cleanup)
  └─ Berhasil → revalidatePath() → return { success: true, data }
```

---

### 6.6 Database Flow — Supabase PostgreSQL

```
Prisma Client (lib/db.ts — Singleton)
  │
  ▼
@prisma/adapter-pg → pg Pool
  │
  ├─ Production (Vercel serverless)
  │    └─ DATABASE_URL (PgBouncer Transaction Pooler, port 6543)
  │         Alasan: Vercel menjalankan banyak serverless function bersamaan.
  │         PgBouncer mengelola connection pool sehingga tidak overflow.
  │
  └─ Migration (CLI)
       └─ DIRECT_URL (Direct DB, port 5432)
            Alasan: `prisma migrate dev` butuh advisory locks yang
            tidak didukung PgBouncer.
  │
  ▼
Supabase PostgreSQL
  │
  ├─ Row Level Security (RLS)
  │    Catatan: RLS aktif di level DB. Server Actions menggunakan
  │    Prisma dengan service-role key yang bypass RLS — otorisasi
  │    sepenuhnya dilakukan di requireAuth() / requireRole() di kode.
  │
  ├─ Database Triggers (supabase/migrations/*)
  │    └─ Setiap INSERT/UPDATE/DELETE pada tabel kas →
  │       otomatis mencatat ke audit_log
  │
  └─ SQL View: public.dues_summary
       └─ Join dues_payments + users + dues_periods
          Digunakan oleh getDuesSummary() untuk dashboard kas
```

---

### 6.7 Revalidasi Cache Flow

```
Server Action berhasil melakukan mutasi DB
  │
  ▼
revalidatePath('/path')  — dipanggil untuk SEMUA path yang terdampak
  │
  Contoh setelah createAnnouncement():
    revalidatePath('/pengumuman')
    revalidatePath('/admin/pengumuman')
  │
  ▼
Next.js App Router menandai cache halaman tersebut sebagai stale
  │
  ▼
Request berikutnya ke halaman tersebut:
  ├─ Server Component di-render ulang
  └─ Data terbaru diambil dari Prisma
```

---

### 6.8 Build & Deployment Flow

```
Developer push ke main branch
  │
  ▼
Vercel CI/CD trigger build:
  │
  ├─ npm install
  ├─ prisma generate  (postinstall hook → generate Prisma client)
  ├─ next build
  │    ├─ Compile TypeScript
  │    ├─ Bundle Client Components
  │    └─ Pre-render Server Components
  │
  ▼
Vercel deploy ke production edge network
  │
  ▼
https://web-class-view.vercel.app aktif dengan build terbaru

Database migration (manual — terpisah dari deploy):
  │
  ▼
npx prisma migrate dev  (via DIRECT_URL, port 5432)
  atau
npx prisma db push       (untuk perubahan kecil tanpa migration file)
```

---

## 7. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│            Client Browser (Mobile & Desktop)            │
│   - Next.js App Router Client Components (React 19)     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS Requests
┌────────────────────────▼────────────────────────────────┐
│               Next.js App Router (Vercel)               │
│                                                         │
│   middleware.ts (Route Guard — setiap request)          │
│   └── updateSession() → refresh cookie Supabase         │
│       └── redirect /login jika tidak terautentikasi     │
│                                                         │
│   Server Components (Read Path)                         │
│   └── await prisma.model.findMany() → render HTML       │
│                                                         │
│   Server Actions (Write Path)                           │
│   └── requireAuth() → requireRole() → Zod.safeParse()  │
│       → Prisma mutation → revalidatePath()              │
│       → return ActionResult<T>                          │
└──────────────┬────────────────────┬─────────────────────┘
               │                    │
┌──────────────▼───────┐  ┌────────▼──────────────────────┐
│   Supabase           │  │   Cloudinary                  │
│   - PostgreSQL + RLS │  │   - Galeri foto               │
│   - Supabase Auth    │  │   - Bukti bayar iuran         │
│   - DB Triggers      │  │   - File materi pelajaran     │
└──────────────────────┘  │   - Avatar pengguna           │
                          └──────────────────────────────┘
```

### Pola Data Flow

**Read (tanpa API Route / tanpa useEffect):**
```
Browser → middleware.ts → Server Component (page.tsx)
        → await prisma.model.findMany()
        → Render HTML ke browser
```

**Write (via Server Actions):**
```
Client form submit → Server Action:
  1. requireAuth()     — validasi session Supabase
  2. requireRole(...)  — cek role di public.users
  3. Zod.safeParse()   — validasi input
  4. Prisma operation  — mutasi database
  5. revalidatePath()  — invalidasi cache Next.js
  6. return ActionResult<T>
```

**File Upload (Atomic):**
```
Client buffer/file → Server Action:
  1. Validasi MIME type & ukuran (Zod)
  2. uploadToCloudinary() → dapat URL & publicId
  3. prisma.model.create() → simpan URL ke DB
  * Jika DB gagal: log error, return failure
```

---

## 8. Data Model

Semua model dikelola dengan **Prisma ORM** dan disimpan di **Supabase PostgreSQL**.

### User
```
id           UUID (dari Supabase Auth)
email        String (unique)
name         String
role         String ("murid" | "bendahara" | "admin")
avatarUrl    String?
createdAt    DateTime
updatedAt    DateTime
```

### DuesPeriod (Periode Iuran)
```
id           CUID
name         String (unique case-insensitive)
amount       Int (dalam Rupiah)
startDate    DateTime
endDate      DateTime
isArchived   Boolean (soft delete)
createdAt    DateTime
updatedAt    DateTime
```

### DuesPayment (Pembayaran Iuran)
```
id                     CUID
studentId              UUID → User
duePeriodId            CUID → DuesPeriod
status                 String ("pending" | "paid")
proofImageUrl          String? (Cloudinary URL)
proofImageCloudinaryId String?
paidAt                 DateTime?
notes                  String?
createdAt              DateTime
updatedAt              DateTime
UNIQUE: (studentId, duePeriodId)
```

### CashTransaction (Transaksi Kas Umum)
```
id          CUID
title       String
amount      Int (dalam Rupiah)
type        String ("INCOME" | "EXPENSE")
category    String?
description String?
createdById UUID → User
createdAt   DateTime
updatedAt   DateTime
```

### Announcement (Pengumuman)
```
id          CUID
title       String
content     String
authorId    UUID → User
status      String ("draft" | "published")
publishedAt DateTime?
createdAt   DateTime
updatedAt   DateTime
```

### Schedule (Jadwal)
```
id          CUID
dayOfWeek   Int (1=Senin ... 5=Jumat)
periodOrder Int (urutan jam pelajaran)
periodLabel String (mis. "07:00–07:45")
subject     String?
teacher     String?
room        String?
isBreak     Boolean
updatedAt   DateTime
UNIQUE: (dayOfWeek, periodOrder)
```

### PhotoGallery (Album Foto)
```
id          CUID
title       String
description String?
eventDate   DateTime
createdAt   DateTime
updatedAt   DateTime
→ photos: Photo[]
```

### Photo
```
id            CUID
galleryId     CUID → PhotoGallery
cloudinaryUrl String
cloudinaryId  String
caption       String?
uploadedAt    DateTime
```

### Attendance (Presensi)
```
id          CUID
studentId   UUID → User
date        Date
status      String ("HADIR" | "IZIN" | "SAKIT" | "ALFA")
checkInTime DateTime? (diisi saat status = "HADIR")
createdAt   DateTime
updatedAt   DateTime
UNIQUE: (studentId, date)
```

### Material (Materi Pelajaran)
```
id           CUID
title        String
subjectName  String
description  String?
fileUrl      String? (Cloudinary URL)
cloudinaryId String?
externalLink String?
createdAt    DateTime
updatedAt    DateTime
```

### ForumPost
```
id          CUID
title       String
content     String
createdById UUID → User
createdAt   DateTime
updatedAt   DateTime
→ comments: ForumComment[]
```

### ForumComment
```
id          CUID
postId      CUID → ForumPost (CASCADE delete)
content     String
createdById UUID → User
isAnswer    Boolean
createdAt   DateTime
updatedAt   DateTime
```

### AuditLog
```
id        CUID
userId    UUID? → User (SET NULL on delete)
action    String
tableName String
recordId  String
oldValues Json?
newValues Json?
createdAt DateTime
```

---

## 9. Server Actions (Mutation API)

Semua mutasi data menggunakan **Next.js Server Actions** — tidak ada `fetch('/api/...')` untuk data internal. Semua action mengembalikan `ActionResult<T>`:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

### `actions/auth.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `signInWithEmail` | `{ email, password, next? }` | `ActionResult<{ redirectTo: string }>` | Publik | Login dengan email & password |
| `signUpWithEmail` | `{ name, email, password, passwordConfirmation, next? }` | `ActionResult<{ status }>` | Publik | Registrasi akun baru |
| `signInWithGoogle` | `{ next? }` | `ActionResult<{ url: string }>` | Publik | Mulai OAuth Google PKCE |
| `signOut` | — | `ActionResult<null>` | Authenticated | Logout & hapus session cookie |

---

### `actions/announcement.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getAnnouncements` | — | `Announcement[]` | All | Semua yang published (murid) / semua (admin/bendahara) |
| `createAnnouncement` | `{ title, content }` | `ActionResult<Announcement>` | admin, bendahara | Buat pengumuman baru (status: draft) |
| `publishAnnouncement` | `announcementId` | `ActionResult<Announcement>` | admin, bendahara, author | Set status menjadi "published" |
| `updateAnnouncement` | `{ id, title?, content? }` | `ActionResult<Announcement>` | admin, bendahara, author | Update judul/konten pengumuman |
| `deleteAnnouncement` | `announcementId` | `ActionResult<Announcement>` | admin, bendahara, author | Hapus permanen pengumuman |

---

### `actions/attendance.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getAttendances` | `dateStr (YYYY-MM-DD)` | `Attendance[]` | All | Semua presensi pada tanggal tertentu |
| `recordAttendance` | `{ studentId, date, status }` | `ActionResult<Attendance>` | All* | Catat/update presensi. Murid hanya bisa untuk dirinya sendiri |
| `getAttendanceStats` | `date (YYYY-MM-DD)` | `ActionResult<AttendanceStats>` | admin, bendahara | Statistik kehadiran: jumlah siswa, hadir, & persentase |

---

### `actions/finance.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `createDuesPeriod` | `{ name, amount, startDate, endDate }` | `ActionResult<DuesPeriod>` | admin, bendahara | Buat periode iuran baru |
| `archiveDuesPeriod` | `periodId` | `ActionResult<DuesPeriod>` | admin, bendahara | Arsipkan periode iuran (soft delete) |
| `markPaymentPaid` | `paymentId, opts?` | `ActionResult<DuesPayment>` | admin, bendahara | Tandai pembayaran lunas, opsional upload bukti |
| `getDuesSummary` | — | `ActionResult<DuesSummaryRow[]>` | admin, bendahara | Ringkasan iuran dari SQL view `dues_summary` |
| `createCashTransaction` | `{ title, amount, type, category?, description? }` | `ActionResult<CashTransaction>` | admin, bendahara | Catat transaksi kas umum (pemasukan/pengeluaran) |
| `getCashTransactions` | — | `ActionResult<CashTransaction[]>` | All | Semua transaksi kas diurutkan terbaru |

---

### `actions/forum.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getForumPosts` | — | `ActionResult<ForumPost[]>` | All | Semua post + komentar + info author |
| `getForumComments` | `postId` | `ActionResult<ForumComment[]>` | All | Semua komentar pada post tertentu |
| `createPost` | `{ title, content }` | `ActionResult<ForumPost>` | All | Buat post forum baru |
| `createComment` | `{ postId, content }` | `ActionResult<ForumComment>` | All | Tambah komentar pada post |
| `markCommentAsAnswer` | `commentId` | `ActionResult<ForumComment>` | admin, bendahara | Tandai komentar sebagai jawaban terbaik (atomik) |
| `deletePost` | `postId` | `ActionResult<ForumPost>` | author or admin/bendahara | Hapus post + komentar (CASCADE) |
| `deleteComment` | `commentId` | `ActionResult<ForumComment>` | author or admin/bendahara | Hapus komentar |

---

### `actions/gallery.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getGalleries` | — | `(PhotoGallery & { photos: Photo[] })[]` | All | Semua album beserta foto-fotonya |
| `createGallery` | `{ title, description?, eventDate }` | `ActionResult<PhotoGallery>` | admin, bendahara | Buat album foto baru |
| `uploadPhoto` | `galleryId, fileBuffer, mimeType, fileSizeBytes, caption?` | `ActionResult<Photo>` | admin, bendahara | Upload foto ke album (Cloudinary + DB) |
| `deletePhoto` | `photoId` | `ActionResult<Photo>` | admin, bendahara | Hapus foto dari Cloudinary & DB |
| `deleteGallery` | `galleryId` | `ActionResult<PhotoGallery>` | admin, bendahara | Hapus album + semua foto (cleanup Cloudinary) |

---

### `actions/material.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getMaterials` | — | `Material[]` | All | Semua materi diurutkan terbaru |
| `createMaterial` | `input, fileBuffer?, fileMimeType?, fileSizeBytes?` | `ActionResult<Material>` | admin, bendahara | Upload file materi atau tambah link eksternal |
| `deleteMaterial` | `materialId` | `ActionResult<Material>` | admin, bendahara | Hapus materi + aset Cloudinary (jika ada) |

Format file yang didukung: `PDF, PPT/PPTX, DOC/DOCX, ZIP/RAR, TXT, JPEG, PNG, WebP` (maks. 10 MB)

---

### `actions/profile.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getProfile` | — | `User \| null` | All | Profil pengguna yang sedang login |
| `updateProfile` | `{ name, avatarUrl? }, avatarBuffer?` | `ActionResult<User>` | All | Update nama & avatar. Role TIDAK bisa diubah |
| `getProfiles` | — | `User[]` | admin | Semua profil pengguna (untuk admin management) |

---

### `actions/schedule.actions.ts`

| Action | Input | Return | Role | Deskripsi |
|--------|-------|--------|------|-----------|
| `getScheduleSlots` | — | `Schedule[]` | All | Semua slot jadwal (ordered by day & period) |
| `upsertScheduleSlot` | `{ dayOfWeek, periodOrder, periodLabel, subject?, teacher?, room?, isBreak }` | `ActionResult<Schedule>` | admin, bendahara | Buat atau update slot jadwal |
| `deleteScheduleSlot` | `slotId` | `ActionResult<Schedule>` | admin, bendahara | Hapus slot jadwal |

---

## 10. HTTP Endpoints (API Routes)

Hanya 2 API Route HTTP yang ada — semua mutasi menggunakan Server Actions.

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/api/auth/callback` | — | OAuth callback handler (Supabase PKCE). Redirect ke `/` atau path `next` setelah login berhasil |
| `GET` | `/api/ping` | — | Health check. Menjalankan `SELECT 1` ke database. Digunakan untuk keep-alive koneksi DB di Vercel free tier |

---

## 11. Struktur Halaman (App Router)

### Halaman Publik / Auth

| Path | Deskripsi |
|------|-----------|
| `/` | Halaman utama — pengalihan ke `/login` jika belum login |
| `/login` | Halaman login (email/password + Google) |
| `/auth/callback` | Redirect handler OAuth |

### Halaman Pengguna (Semua role yang sudah login)

| Path | Deskripsi |
|------|-----------|
| `/galeri` | Daftar album foto kelas |
| `/jadwal` | Grid jadwal pelajaran mingguan |
| `/kas` | Ringkasan keuangan & status iuran |
| `/pengumuman` | Daftar pengumuman yang dipublish |
| `/presensi` | Form & riwayat presensi |
| `/materi` | Daftar materi pelajaran yang dapat didownload |
| `/forum` | Daftar thread diskusi & komentar |
| `/profil` | Halaman profil pengguna |

### Halaman Admin (Role: admin / bendahara)

| Path | Deskripsi |
|------|-----------|
| `/admin/dashboard` | Dashboard ringkasan kelas |
| `/admin/galeri` | Manajemen album & foto |
| `/admin/jadwal` | CRUD jadwal pelajaran |
| `/admin/kas` | Manajemen iuran & transaksi kas |
| `/admin/pengumuman` | CRUD pengumuman + publish/unpublish |
| `/admin/presensi` | Rekap & input presensi siswa |
| `/admin/materi` | Upload & hapus materi pelajaran |
| `/admin/forum` | Moderasi forum (hapus post/komentar, tandai jawaban) |

---

## 12. Autentikasi & Otorisasi

### Autentikasi
- Provider: **Supabase Auth**
- Metode: Email/password & Google OAuth (PKCE flow)
- Session: **HttpOnly cookie** — tidak ada token manual
- Middleware (`middleware.ts`): Setiap request diproses oleh `updateSession()` untuk menyegarkan cookie Supabase dan melindungi rute privat

### Otorisasi (Defense in Depth — 2 Lapis)

**Lapis 1 — Server Action Guards (Sumber kebenaran):**
```ts
requireAuth()          // Cek session valid dari Supabase Auth
requireRole(user, [...roles])  // Cek role di tabel public.users
```

**Lapis 2 — UI Control (UX only):**
- Tombol edit/hapus hanya ditampilkan untuk admin/bendahara
- Halaman `/admin/*` hanya dirender untuk pengguna berperan admin/bendahara
- Lapisan ini bukan pengganti keamanan — murni untuk UX

### Aturan Keamanan Khusus
- `authorId` selalu diambil dari **session**, tidak pernah dari input user
- Role pengguna **tidak dapat diubah** melalui `updateProfile`
- Siswa (`murid`) hanya bisa mencatat presensi **dirinya sendiri**
- Pembayaran yang sudah `paid` tidak bisa ditandai paid lagi

---

## 13. Storage & File Upload

Semua file disimpan di **Cloudinary** (bukan Supabase Storage).

| Folder Cloudinary | Konten | Validasi |
|-------------------|--------|----------|
| `gallery/` | Foto album kelas | Image types (JPEG, PNG, WebP, GIF) |
| `proofs/` | Bukti pembayaran iuran | Image types, maks. 5 MB |
| `materi/` | File materi pelajaran | PDF, PPT/X, DOC/X, ZIP/RAR, TXT, JPEG, PNG, WebP — maks. 10 MB |
| `avatars/` | Foto profil pengguna | Image types |

**Pola upload (Atomic):** Cloudinary upload → simpan URL ke DB → jika DB gagal, log error & return failure.

---

## 14. Desain Visual

**Tema: Cosmic / Deep Space** — Web ini adalah galaksi kecil milik RPL 1.

### Warna Utama

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| Background | `#0B0B1A` | Deep space black — latar semua halaman |
| Surface | `#15152D` | Nebula — background card & panel |
| Glass | `bg-white/5 backdrop-blur-md border-white/10` | Card glassmorphism |
| Aksen Primary | `from-purple-600 via-indigo-600 to-cyan-500` | Gradient utama — tombol, heading |
| Aksen Secondary | `from-indigo-400 to-cyan-400` | Starlight — ikon, badge |

### Status Colors (Badge)

| Status | Warna |
|--------|-------|
| Hadir / Lunas / Published | Emerald (`text-emerald-400`) |
| Pending / Izin / Draft | Amber (`text-amber-400`) |
| Overdue / Sakit / Urgent | Rose (`text-rose-400`) |
| Alfa / Archived | Slate (`text-slate-400`) |

### Prinsip UI
- **Mobile-first** — desain dari lebar 360px
- **Glassmorphism** — card transparan dengan backdrop blur
- **Cosmic glow** — efek pendaran pada aksen dan ikon
- Ikon: **lucide-react** secara eksklusif
- Font: **Geist** (sans) + **Geist Mono**
- Di mobile (`< md`): tabel diubah menjadi card list vertikal

---

## 15. Variabel Lingkungan

Salin `.env.example` ke `.env.local` dan isi nilainya.

| Variabel | Akses | Deskripsi |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + Server | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (admin bypass) |
| `DATABASE_URL` | Server only | Transaction Pooler (port 6543, `?pgbouncer=true`) — untuk runtime |
| `DIRECT_URL` | Server only | Direct DB URL (port 5432) — untuk Prisma migrate/push |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client + Server | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Client + Server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Server only | Cloudinary API secret |
| `NEXT_PUBLIC_APP_URL` | Client + Server | App URL (mis. `https://web-class-view.vercel.app`) |

---

## 16. Testing

Framework: **Vitest** (unit) + **fast-check** (Property-Based Testing).

```bash
npm run test        # Jalankan semua test sekali
npm run test:ui     # Buka Vitest UI
```

### Cakupan Test

| File Test | Cakupan |
|-----------|---------|
| `__tests__/actions/forum.property.test.ts` | Property-based test untuk forum actions |
| `__tests__/db/payment-unique.property.test.ts` | Validasi unique constraint `(studentId, duePeriodId)` |
| `__tests__/validations/material.property.test.ts` | PBT validasi MIME type & ukuran file materi |
| `__tests__/setup.test.ts` | Setup dasar environment test |

---

## 17. Deployment

### Stack Deploy
- **Frontend + Backend**: [Vercel](https://vercel.com) (free tier)
- **Database + Auth**: [Supabase](https://supabase.com) (free tier)
- **Media Storage**: [Cloudinary](https://cloudinary.com) (free tier, 1 GB)

### URL Produksi
```
https://web-class-view.vercel.app
```

### Perintah Build
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server (lokal)
npm run lint    # ESLint check
```

### Catatan Infrastruktur
- Supabase free tier dapat **pause setelah 1 minggu idle** — gunakan endpoint `/api/ping` sebagai keep-alive cron
- Cloudinary free: 1 GB storage, 25 kredit transformasi/bulan — kompres gambar sebelum upload
- Database migration: gunakan `prisma migrate dev` (via `DIRECT_URL`) bukan transaction pooler
- Connection pooling: Prisma singleton pattern (`lib/db.ts`) untuk mencegah connection leak di serverless

---

## 18. Error Handling & Pesan Error

Semua Server Action mengembalikan `ActionResult<T>`. Berikut katalog pesan error yang bisa diterima client per domain.

### Auth

| Kondisi | Pesan Error |
|---------|-------------|
| Email atau password salah | `"Email atau kata sandi tidak sesuai."` |
| Email belum dikonfirmasi | `"Periksa email Anda dan konfirmasi akun sebelum masuk."` |
| Password konfirmasi tidak cocok | `"Konfirmasi kata sandi tidak sama."` |
| OAuth Google gagal / ditolak user | redirect ke `/login?error=auth_failed` |
| Tidak bisa logout | `"Tidak dapat keluar. Silakan coba lagi."` |
| Error tidak terduga | `"Terjadi kesalahan. Silakan coba lagi."` |

### Pengumuman

| Kondisi | Pesan Error |
|---------|-------------|
| Tidak terautentikasi | `"Sesi tidak valid."` |
| Role tidak cukup | `"Akses ditolak."` |
| Pengumuman tidak ditemukan | `"Pengumuman tidak ditemukan."` |
| User bukan author/admin/bendahara | `"Akses ditolak."` |

### Presensi

| Kondisi | Pesan Error |
|---------|-------------|
| studentId bukan UUID valid | `"studentId harus berupa UUID yang valid."` |
| Format tanggal salah | `"Format tanggal harus YYYY-MM-DD."` |
| Status tidak dikenali | `"Status presensi harus salah satu dari: HADIR, IZIN, SAKIT, ALFA."` |
| Murid coba rekam presensi orang lain | `"Akses ditolak. Anda hanya dapat mencatat presensi diri sendiri."` |

### Kas — Iuran

| Kondisi | Pesan Error |
|---------|-------------|
| Nama periode duplikat | `"Periode iuran dengan nama tersebut sudah ada."` |
| Tanggal selesai ≤ tanggal mulai | `"Tanggal selesai harus lebih besar dari tanggal mulai."` |
| Payment tidak ditemukan | `"Data pembayaran tidak ditemukan."` |
| Payment sudah lunas | `"Pembayaran ini sudah tercatat sebagai lunas."` |
| Upload bukti gagal | `"Gagal mengupload bukti pembayaran. Coba lagi."` |
| Format bukti bayar tidak didukung | `"Format bukti bayar harus JPEG, PNG, atau WebP."` |
| Ukuran bukti bayar > 5 MB | `"Ukuran bukti bayar maksimal 5 MB."` |

### Galeri

| Kondisi | Pesan Error |
|---------|-------------|
| Format foto tidak didukung | `"Format foto harus JPEG, PNG, atau WebP."` |
| Ukuran foto > 5 MB | `"Ukuran foto maksimal 5 MB."` |
| Album tidak ditemukan | `"Album tidak ditemukan."` |
| Foto tidak ditemukan | `"Foto tidak ditemukan."` |

### Materi

| Kondisi | Pesan Error |
|---------|-------------|
| Format file tidak didukung | `"Format file tidak didukung. Gunakan PDF, PPT/X, DOC/X, ZIP/RAR, TXT, JPEG, PNG, atau WebP."` |
| Ukuran file > 10 MB | `"Ukuran file maksimal 10 MB."` |
| Tidak ada file dan tidak ada link | `"Harus menyertakan salah satu: file atau tautan eksternal."` |
| Ada file DAN link sekaligus | `"Tidak boleh menyertakan file dan tautan eksternal sekaligus."` |
| Materi tidak ditemukan | `"Materi tidak ditemukan."` |

### Forum

| Kondisi | Pesan Error |
|---------|-------------|
| Post tidak ditemukan | `"Postingan tidak ditemukan."` |
| Komentar tidak ditemukan | `"Komentar tidak ditemukan."` |
| Tidak punya izin hapus post | `"Anda tidak memiliki izin untuk menghapus postingan ini."` |
| Tidak punya izin hapus komentar | `"Anda tidak memiliki izin untuk menghapus komentar ini."` |

### Jadwal

| Kondisi | Pesan Error |
|---------|-------------|
| Hari tidak valid | `"Hari tidak valid (0–4)."` |
| Urutan periode tidak valid | `"Urutan periode tidak valid (1–8)."` |
| Mata pelajaran kosong (bukan istirahat) | `"Mata pelajaran wajib diisi untuk slot yang bukan istirahat."` |

---

## 19. Validation Rules per Domain

Semua validasi menggunakan **Zod v4** dan dijalankan di **client** (sebelum submit) dan **server** (di dalam Server Action).

### Auth
| Field | Aturan |
|-------|--------|
| `name` | min 2 karakter, maks 100 karakter, di-trim |
| `email` | format email valid, di-trim |
| `password` | min 8 karakter |
| `passwordConfirmation` | wajib diisi, harus sama dengan `password` |

### Pengumuman
| Field | Aturan |
|-------|--------|
| `title` | wajib, min 1 karakter, maks 200 karakter |
| `content` | wajib, min 1 karakter |
| `id` (update) | wajib, min 1 karakter |

### Presensi
| Field | Aturan |
|-------|--------|
| `studentId` | UUID format valid |
| `date` | format `YYYY-MM-DD` (regex) |
| `status` | enum: `HADIR` \| `IZIN` \| `SAKIT` \| `ALFA` |

### Kas — Periode Iuran
| Field | Aturan |
|-------|--------|
| `name` | wajib, min 1, maks 100 karakter |
| `amount` | integer, min 1, maks 999.999.999 |
| `startDate` | ISO datetime valid |
| `endDate` | ISO datetime valid, **harus > `startDate`** |

### Kas — Transaksi Umum
| Field | Aturan |
|-------|--------|
| `title` | wajib, min 1, maks 150 karakter |
| `amount` | integer, min 1 |
| `type` | enum: `INCOME` \| `EXPENSE` |
| `category` | opsional, maks 100 karakter |
| `description` | opsional, maks 500 karakter |

### Kas — Bukti Bayar
| Field | Aturan |
|-------|--------|
| `mimeType` | enum: `image/jpeg` \| `image/png` \| `image/webp` |
| `fileSizeBytes` | integer, maks 5.242.880 (5 MB) |
| `notes` | opsional, maks 500 karakter |

### Galeri
| Field | Aturan |
|-------|--------|
| `title` | wajib, min 1, maks 200 karakter |
| `description` | opsional, maks 500 karakter |
| `eventDate` | ISO datetime valid |
| `mimeType` (foto) | enum: `image/jpeg` \| `image/png` \| `image/webp` |
| `fileSizeBytes` (foto) | integer, maks 5.242.880 (5 MB) |
| `caption` | opsional, maks 300 karakter |

### Materi
| Field | Aturan |
|-------|--------|
| `title` | wajib, min 1, maks 200 karakter |
| `subjectName` | wajib, min 1, maks 100 karakter |
| `description` | opsional, maks 500 karakter |
| `fileUrl` | URL valid (opsional, diisi server setelah upload) |
| `externalLink` | URL valid (opsional) |
| XOR rule | **Tepat satu** dari `fileUrl` atau `externalLink` harus ada |
| MIME type | 12 tipe didukung: PDF, DOC/X, PPT/X, ZIP, RAR, TXT, JPEG, PNG, WebP |
| Ukuran file | maks 10.485.760 (10 MB) |

### Forum
| Field | Aturan |
|-------|--------|
| `title` (post) | wajib, min 1, maks 200 karakter |
| `content` (post) | wajib, min 1 karakter |
| `postId` (komentar) | wajib, min 1 karakter |
| `content` (komentar) | wajib, min 1 karakter |

### Jadwal
| Field | Aturan |
|-------|--------|
| `dayOfWeek` | integer 0–4 (0=Senin, 4=Jumat) |
| `periodOrder` | integer 1–8 |
| `periodLabel` | wajib, min 1, maks 20 karakter (mis. `"07:00–07:45"`) |
| `subject` | opsional, maks 100 karakter; **wajib jika `isBreak = false`** |
| `teacher` | opsional, maks 100 karakter |
| `room` | opsional, maks 50 karakter |
| `isBreak` | boolean, default `false` |

### Profil
| Field | Aturan |
|-------|--------|
| `name` | wajib, min 1, maks 100 karakter |
| `avatarUrl` | URL valid (opsional, hanya diisi saat upload avatar) |

---

## 20. Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────┐
│  auth.users (Supabase Auth — read-only dari aplikasi)        │
│  id UUID                                                     │
└──────────────────────┬───────────────────────────────────────┘
                       │ TRIGGER: on_auth_user_created
                       │ (auto-create public.users row)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  public.users                                                │
│  id UUID PK                                                  │
│  email UNIQUE                                                │
│  name                                                        │
│  role  "murid" | "bendahara" | "admin"                       │
│  avatarUrl?                                                  │
└───┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────┘
    │      │      │      │      │      │      │
    │      │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌───────┐ ┌─────────────┐ ┌──────────┐ ┌──────────────┐
│Attend-│ │DuesPayment  │ │Announce- │ │ForumPost     │
│ance   │ │             │ │ment      │ │              │
│       │ │studentId FK │ │          │ │createdById FK│
│student│ │             │ │authorId  │ │              │
│Id FK  │ └──────┬──────┘ │FK        │ └──────┬───────┘
│       │        │         └──────────┘        │
└───────┘        │                             ▼
                 ▼                      ┌──────────────┐
          ┌─────────────┐               │ForumComment  │
          │DuesPeriod   │               │              │
          │             │               │postId FK     │
          │id PK        │               │createdById FK│
          │name UNIQUE  │               │isAnswer      │
          │amount       │               └──────────────┘
          │startDate    │
          │endDate      │
          │isArchived   │
          └─────────────┘

┌──────────────────────────────────────────────────────────────┐
│  CashTransaction                                             │
│  createdById FK → users.id                                   │
│  type "INCOME" | "EXPENSE"                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PhotoGallery                                                │
│  id PK                                                       │
│  eventDate                                                   │
└──────────────────┬───────────────────────────────────────────┘
                   │ CASCADE DELETE
                   ▼
            ┌──────────────┐
            │  Photo       │
            │  galleryId FK│
            │  cloudinaryId│
            └──────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Schedule                                                    │
│  UNIQUE (dayOfWeek, periodOrder)                             │
│  (tabel mandiri, tidak berelasi ke users)                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Material                                                    │
│  (tabel mandiri, tidak berelasi ke users)                    │
│  XOR: fileUrl OR externalLink (enforced by Zod, not DB)      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  AuditLog                                                    │
│  userId FK → users.id (SET NULL on delete)                   │
│  Diisi otomatis oleh DB trigger, bukan oleh kode aplikasi    │
└──────────────────────────────────────────────────────────────┘

SQL VIEW: public.dues_summary
  ← JOIN dues_payments + users + dues_periods
  ← Filter: is_archived = FALSE
  ← Digunakan oleh getDuesSummary()

Unique Constraints Penting:
  - users.email               UNIQUE
  - DuesPayment(studentId, duePeriodId)  UNIQUE
  - Attendance(studentId, date)          UNIQUE
  - Schedule(dayOfWeek, periodOrder)     UNIQUE
```

---

## 21. Audit Trail & Database Triggers

Ada 3 database object yang dibuat via migration `supabase/migrations/20240101_001_triggers.sql`:

### Trigger 1: `on_auth_user_created`
- **Tabel**: `auth.users` (Supabase Auth internal)
- **Event**: `AFTER INSERT`
- **Fungsi**: `public.handle_new_user()`
- **Tujuan**: Setiap kali user baru mendaftar (email atau Google OAuth), otomatis membuat baris di `public.users` dengan role default `"murid"`.
- **Behavior**:
  - `name` diambil dari `raw_user_meta_data->>'name'` (terisi saat Google OAuth atau registrasi dengan nama). Jika kosong, fallback ke `email`.
  - `ON CONFLICT (id) DO NOTHING` — aman jika trigger terpanggil ganda.
  - `SECURITY DEFINER` — berjalan sebagai superuser untuk bypass RLS.

### Trigger 2: `audit_dues_payment_changes`
- **Tabel**: `public.dues_payments`
- **Event**: `AFTER INSERT OR UPDATE OR DELETE`
- **Fungsi**: `public.audit_dues_payment()`
- **Tujuan**: Setiap perubahan pada data pembayaran iuran otomatis dicatat ke `audit_log` untuk transparansi dan akuntabilitas keuangan.
- **Kolom yang dicatat**:

| Event DB | action dicatat | old_values | new_values |
|----------|---------------|------------|------------|
| `INSERT` | `payment_created` | `NULL` | seluruh row baru |
| `UPDATE` | `payment_updated` | row sebelum update | row setelah update |
| `DELETE` | `payment_deleted` | row yang dihapus | `NULL` |

- **`user_id`**: diambil dari `auth.uid()` — UUID pengguna yang sedang login saat mutasi terjadi.
- **Atomicity**: Jika INSERT ke `audit_log` gagal, seluruh transaksi di-rollback (pembayaran juga tidak tersimpan).
- `SECURITY DEFINER` — bypass RLS untuk bisa menulis ke `audit_log`.

### View: `public.dues_summary`
- **Tujuan**: Menyediakan ringkasan iuran yang siap pakai — join antara `dues_payments`, `users`, dan `dues_periods`.
- **Filter**: `WHERE dper.is_archived = FALSE` — periode yang sudah diarsipkan tidak tampil.
- **Digunakan oleh**: `getDuesSummary()` di `finance.actions.ts`.
- **Kolom yang tersedia**: `id`, `student_id`, `name`, `email`, `period_id`, `period_name`, `amount`, `status`, `paid_at`, `proof_image_url`.

---

## 22. Local Development Setup

Langkah-langkah dari clone hingga development server berjalan.

### Prasyarat

| Tools | Versi minimal |
|-------|---------------|
| Node.js | 20.x |
| npm | 10.x |
| Git | 2.x |
| Akun Supabase | free tier |
| Akun Cloudinary | free tier |

### Langkah 1 — Clone & Install

```bash
git clone <repo-url> class-rpl-1-202627
cd class-rpl-1-202627
npm install
# postinstall otomatis menjalankan: prisma generate
```

### Langkah 2 — Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Catat: **Project URL**, **Publishable Key**, **Service Role Key**
3. Aktifkan **Google OAuth Provider** di Authentication → Providers:
   - Tambahkan redirect URL: `https://<your-url>/api/auth/callback`
   - Untuk dev lokal: `http://localhost:3000/api/auth/callback`
4. Ambil **Database URL** (Transaction Pooler port 6543) dan **Direct URL** (port 5432) dari Project Settings → Database

### Langkah 3 — Setup Cloudinary

1. Buat akun di [cloudinary.com](https://cloudinary.com)
2. Dari Dashboard, catat: **Cloud Name**, **API Key**, **API Secret**

### Langkah 4 — Environment Variables

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Langkah 5 — Database Migration

```bash
# Push schema ke Supabase (development)
npx prisma db push

# ATAU jalankan migration resmi
npx prisma migrate dev
```

Kemudian apply database triggers dan view:

```bash
# Copy isi supabase/migrations/20240101_001_triggers.sql
# Jalankan di Supabase SQL Editor (Dashboard → SQL Editor)
```

### Langkah 6 — Jalankan Dev Server

```bash
npm run dev
# → http://localhost:3000
```

### Langkah 7 — Verifikasi

```bash
# Cek koneksi database
curl http://localhost:3000/api/ping
# → { "ok": true, "timestamp": "..." }

# Jalankan test suite
npm run test
```

### Perintah Berguna Lainnya

```bash
npx prisma studio          # GUI browser untuk inspect database
npx prisma migrate dev     # Buat migration baru dari perubahan schema
npx prisma db push         # Push schema langsung (tanpa migration file)
npx prisma generate        # Re-generate Prisma client (setelah ubah schema)
npm run lint               # ESLint check
npm run build              # Production build check
```

---

## 23. Coding Conventions & File Structure Guide

### Prinsip Utama

| Prinsip | Detail |
|---------|--------|
| **Zero `any`** | Gunakan `unknown` + Zod narrowing. `any` dilarang keras. |
| **Dual validation** | Setiap input divalidasi di client (Zod) DAN server (Zod lagi di Server Action) |
| **Server Actions untuk mutasi** | Tidak ada `fetch('/api/...')` untuk data internal |
| **`authorId` dari session** | Tidak pernah dari user input — selalu dari `requireAuth()` |
| **Atomic uploads** | Cloudinary upload sebelum DB insert. Jika DB gagal, log error |
| **Mobile-first 360px** | Desain dan test dari lebar terkecil dulu |

### Naming Convention

| Jenis | Convention | Contoh |
|-------|------------|--------|
| React Component / Page | `PascalCase.tsx` | `AdminForumModeration.tsx` |
| Server Action file | `domain.actions.ts` | `finance.actions.ts` |
| Validation schema file | `domain.ts` | `kas.ts` |
| Route folder | `kebab-case` | `app/admin/jadwal/` |
| Local component folder | `_components/` | `app/galeri/_components/` |
| Import alias | `@/...` | `@/lib/db`, `@/actions/forum.actions` |

### Struktur Direktori

```
class-rpl-1-202627/
├── actions/               ← Server Actions per domain (mutasi + query)
├── app/                   ← Next.js App Router
│   ├── admin/             ← Halaman khusus admin/bendahara
│   │   └── [modul]/
│   │       ├── page.tsx           ← Server Component (data fetching)
│   │       └── _components/       ← Client Components (UI + state)
│   ├── [modul]/           ← Halaman publik (semua role)
│   │   ├── page.tsx
│   │   └── _components/
│   ├── api/               ← HTTP API Routes (hanya 2: callback + ping)
│   ├── auth/              ← Auth callback route
│   ├── login/             ← Halaman login
│   ├── layout.tsx         ← Root layout
│   ├── error.tsx          ← Error boundary
│   └── global-error.tsx   ← Global error boundary
├── components/
│   ├── auth/              ← Auth-specific components
│   └── shared/            ← Reusable global components (Navbar, Sidebar)
├── lib/
│   ├── actions/           ← Auth guards: requireAuth(), requireRole()
│   ├── auth/              ← Auth utilities (redirect, session)
│   ├── supabase/          ← Supabase client (server.ts, client.ts, middleware.ts)
│   ├── validations/       ← Zod schemas per domain
│   ├── cloudinary.ts      ← Cloudinary server helper + folder constants
│   ├── db.ts              ← Prisma singleton
│   ├── env.ts             ← Environment variable guard
│   ├── types.ts           ← Centralized TypeScript types
│   └── utils.ts           ← Shared utilities (formatError, formatCurrency, dll)
├── prisma/
│   └── schema.prisma      ← Database schema
├── supabase/
│   └── migrations/        ← SQL triggers dan views
├── __tests__/             ← Vitest + fast-check property tests
├── generated/prisma/      ← Generated Prisma client (jangan diedit manual)
└── middleware.ts           ← Route guard (updateSession per request)
```

### Aturan Komponen

**Server Component** (default — tidak ada `"use client"`):
- Fetch data awal dengan `await prisma...` atau `await serverAction()`
- Render HTML murni, tidak ada event handler
- Gunakan di `page.tsx` dan layout

**Client Component** (dengan `"use client"`):
- Hanya untuk komponen yang butuh `useState`, `useEffect`, atau event listener (`onClick`, `onSubmit`)
- Selalu taruh di folder `_components/` lokal route terkait
- Nama file: `NamaMudulClient.tsx` atau `NamaFiturForm.tsx`

**Yang dilarang:**
```tsx
// ❌ SALAH — SubCard dideklarasi di dalam render, state akan reset tiap render
export default function Page() {
  const SubCard = () => <div>...</div>;
  return <SubCard />;
}

// ✅ BENAR — taruh di luar atau file terpisah
const SubCard = () => <div>...</div>;
export default function Page() {
  return <SubCard />;
}
```

### Utility yang Tersedia di `lib/utils.ts`

Gunakan ini, jangan buat yang baru:

| Fungsi | Kegunaan |
|--------|---------|
| `formatError(err: unknown)` | Konversi error apapun menjadi string yang aman ditampilkan ke user |
| `formatCurrency(amount: number)` | Format angka ke Rupiah (mis. `"Rp 50.000"`) |
| `formatDate(date: Date \| string \| null)` | Format tanggal ke string lokal Indonesia |

---

## 24. Known Limitations & Gotchas

### Infrastruktur

| Masalah | Detail | Solusi |
|---------|--------|--------|
| **Supabase free tier pause** | Project Supabase otomatis di-pause setelah 1 minggu tidak ada request. Semua operasi DB akan gagal hingga di-resume manual. | Setup cron job eksternal (mis. GitHub Actions schedule atau UptimeRobot) yang hit `/api/ping` setiap hari. |
| **Cloudinary orphan asset** | Jika upload Cloudinary berhasil tapi DB insert gagal, file di Cloudinary tidak otomatis dihapus. | Error di-log dengan `cloudinaryId`. Cleanup manual via Cloudinary Dashboard atau jalankan cleanup script. |
| **PgBouncer vs Direct URL** | `DATABASE_URL` (port 6543) memakai PgBouncer transaction pooling — tidak support advisory locks. `prisma migrate dev` akan gagal jika pakai URL ini. | Selalu pakai `DIRECT_URL` (port 5432) untuk semua operasi Prisma CLI. |
| **Vercel function timeout** | Upload file besar bisa timeout di Vercel free tier (10 detik). | Kompres gambar di client sebelum kirim ke server. Materi file maks 10 MB. |

### Development

| Masalah | Detail | Solusi |
|---------|--------|--------|
| **Prisma generate setelah ubah schema** | Setelah edit `schema.prisma`, Prisma client belum terupdate sampai `npx prisma generate` dijalankan. TypeScript akan menunjukkan error palsu. | Jalankan `npx prisma generate` atau `npx prisma db push` (yang otomatis generate). |
| **Hot reload + Prisma singleton** | Tanpa singleton pattern di `lib/db.ts`, Next.js dev mode akan membuat koneksi DB baru di setiap hot reload, cepat overflow connection limit. | Sudah ditangani — jangan ganti pola singleton di `lib/db.ts`. |
| **Next.js 16 breaking changes** | Next.js 16 punya perubahan dari versi sebelumnya. Middleware file disebut `proxy.ts` bukan `middleware.ts` di dokumentasi internal, tapi file aktualnya masih `middleware.ts`. | Baca `node_modules/next/dist/docs/` sebelum menulis kode yang menyentuh App Router internals. |
| **Supabase Auth vs Prisma user** | Ada dua representasi user: `auth.users` (Supabase, read-only) dan `public.users` (Prisma). Trigger `on_auth_user_created` menyinkronnya otomatis, tapi jika trigger belum diapply, login bisa berhasil tapi `requireAuth()` gagal karena tidak ada row di `public.users`. | Pastikan migration trigger sudah dijalankan setelah setup database baru. |
| **RLS bypass via Prisma** | Prisma menggunakan `SUPABASE_SERVICE_ROLE_KEY` yang bypass Row Level Security. Otorisasi sepenuhnya bergantung pada `requireAuth()` dan `requireRole()` di kode aplikasi — bukan RLS. | Jangan pernah skip `requireAuth()` di Server Action yang mengakses data sensitif. |
| **`markCommentAsAnswer` race condition** | Operasi tandai jawaban menggunakan `prisma.$transaction` untuk atomik clear + set. Jika ada dua request bersamaan, salah satu akan menunggu lock DB. | Sudah ditangani dengan Prisma transaction. |

### Cloudinary Free Tier

| Batasan | Detail |
|---------|--------|
| Storage | 1 GB total |
| Transformasi | 25 kredit/bulan |
| Bandwidth | 25 GB/bulan |

Upload file besar atau banyak transformasi otomatis bisa menghabiskan kredit cepat. Kompres gambar di client sebelum upload (rekomendasikan ukuran < 1 MB per foto untuk galeri).

---

*Dokumen ini di-generate secara otomatis dari source code proyek. Terakhir diperbarui: September 2026.*

---

## 25. Performance & Optimization Guide

Panduan konkret agar aplikasi tetap ringan, cepat, dan tidak membebani Vercel free tier.

---

### 25.1 Prinsip Utama: Maksimalkan Server Components

Server Components adalah keunggulan terbesar arsitektur ini — gunakan sebanyak mungkin.

```
✅ Server Component (default):
   - Tidak kirim JavaScript ke browser
   - Data di-fetch di server sebelum HTML dikirim
   - Cocok untuk semua halaman read-only

✅ Client Component ("use client") — hanya jika butuh:
   - useState / useEffect
   - Event handler (onClick, onSubmit)
   - Browser-only API

❌ Jangan jadikan Server Component menjadi Client Component
   hanya karena "lebih mudah". Setiap "use client" = tambahan JS bundle.
```

Aturan praktis: buat halaman sebagai Server Component, extract bagian interaktif ke komponen daun kecil di `_components/`, beri `"use client"` hanya pada komponen itu.

---

### 25.2 Image Optimization

Galeri foto adalah fitur paling berat secara bandwidth.

**Gunakan `next/image` untuk semua gambar:**
```tsx
// ✅ BENAR — otomatis: resize, WebP conversion, lazy load
import Image from 'next/image';
<Image
  src={photo.cloudinaryUrl}
  alt={photo.caption ?? ''}
  width={400}
  height={300}
  loading="lazy"
  className="object-cover"
/>

// ❌ SALAH — tidak ada optimasi
<img src={photo.cloudinaryUrl} />
```

**Cloudinary URL transformation** — minta ukuran yang dibutuhkan, bukan full-res:
```ts
// Tambahkan transformation di URL sebelum render
const optimizedUrl = cloudinaryUrl.replace(
  '/upload/',
  '/upload/w_800,f_auto,q_auto/'
);
```

**Batas ukuran upload yang disarankan:**

| Konteks | Diterima server | Rekomendasi upload |
|---------|-----------------|-------------------|
| Foto galeri | 5 MB | < 1 MB per foto |
| Bukti bayar | 5 MB | < 500 KB |
| Avatar | tidak ada limit | < 200 KB |
| Materi (file) | 10 MB | sesuai kebutuhan |

---

### 25.3 Caching & Revalidation Strategy

**Gunakan `revalidatePath` secara targeted:**
```ts
// ✅ BENAR — hanya path yang terdampak
revalidatePath('/galeri');
revalidatePath('/admin/galeri');

// ❌ BERLEBIHAN — re-render semua halaman, gunakan hanya untuk auth changes
revalidatePath('/', 'layout');
```

**Halaman yang cocok untuk cache lebih lama:**
- `/jadwal` — jadwal jarang berubah, bisa static
- `/materi` — bisa ISR revalidate 60 detik
- `/pengumuman` — bisa ISR revalidate 30 detik

Biarkan Next.js App Router cache bekerja. Jangan tambahkan `cache: 'no-store'` tanpa alasan jelas.

---

### 25.4 Database Query Optimization

**Select hanya field yang dibutuhkan:**
```ts
// ✅ BENAR
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, role: true },
});

// ❌ BOROS — ambil semua field
const user = await prisma.user.findUnique({ where: { id: userId } });
```

**Gunakan `Promise.all` untuk query independen:**
```ts
// ✅ BENAR — paralel (~50ms total)
const [students, present] = await Promise.all([
  prisma.user.count({ where: { role: 'murid' } }),
  prisma.attendance.count({ where: { date, status: 'HADIR' } }),
]);

// ❌ LAMBAT — berurutan (~100ms total)
const students = await prisma.user.count(...);
const present = await prisma.attendance.count(...);
```

**Batasi hasil dengan `take` untuk list panjang:**
```ts
prisma.forumPost.findMany({
  take: 20,
  orderBy: { createdAt: 'desc' },
});
```

---

### 25.5 Vercel Bundle & Function Management

**Import ikon per nama — bukan seluruh library:**
```ts
// ✅ BENAR — tree-shakeable
import { Camera, Trash2 } from 'lucide-react';

// ❌ SALAH
import * as Icons from 'lucide-react';
```

**Jangan format tanggal/angka di Client Component:**
```ts
// ✅ Format di server, kirim string ke client
const formatted = new Intl.DateTimeFormat('id-ID').format(date);

// ❌ Import library besar masuk ke client bundle
'use client';
import { format } from 'date-fns';
```

**Batasi payload Server Action — jangan kirim data redundan:**
- Kirim hanya field yang berubah, bukan seluruh objek
- Untuk upload: kirim `ArrayBuffer` bukan base64 string
- Kompres gambar di client sebelum kirim ke server

**Jaga DB connection warm:**
- `/api/ping` sudah ada — hit dengan cron eksternal setiap 10 menit
- Tools gratis: [UptimeRobot](https://uptimerobot.com), [cron-job.org](https://cron-job.org)
- Vercel free tier function timeout: **10 detik** — upload file besar bisa mendekati limit

---

### 25.6 Mobile Performance (360px First)

**Hindari layout shift (CLS):**
```tsx
// ✅ Selalu sediakan dimensi untuk gambar
<Image width={400} height={300} ... />

// ✅ Skeleton loading untuk konten yang di-load
<div className="animate-pulse bg-white/5 rounded-2xl h-48 w-full" />
```

**Tabel → Card List di mobile:**
```tsx
// Desktop
<div className="hidden md:block"><table>...</table></div>

// Mobile
<div className="md:hidden space-y-3">
  {data.map(item => <MobileCard key={item.id} item={item} />)}
</div>
```

**Minimum touch target 44px:**
```tsx
<button className="h-11 px-4 ...">  {/* h-11 = 44px */}
```

---

## 26. Decision Log

Catatan keputusan teknis penting — kenapa dipilih, apa alternatifnya, dan apa trade-offnya.

| Keputusan | Pilihan | Alternatif Ditolak | Alasan |
|-----------|---------|-------------------|--------|
| **Framework** | Next.js App Router | Remix, SvelteKit, React + Express | Server Components menghilangkan kebutuhan API layer. Satu deploy untuk BE+FE. |
| **Database** | Supabase PostgreSQL | PlanetScale, Neon, Railway | Free tier paling lengkap: DB + Auth dalam satu platform. |
| **ORM** | Prisma | Drizzle, Kysely, raw SQL | Type safety terbaik, migrasi mudah, dokumentasi paling lengkap untuk pemula. |
| **Auth** | Supabase Auth + @supabase/ssr | NextAuth.js, Clerk | Terintegrasi langsung dengan database Supabase. HttpOnly cookie tanpa konfigurasi tambahan. |
| **File Storage** | Cloudinary | Supabase Storage, AWS S3 | Transformasi gambar otomatis (resize, WebP, quality). Free tier 1 GB + 25 kredit transformasi. |
| **Styling** | Tailwind CSS v4 (vanilla) | shadcn/ui, Chakra UI | Zero runtime CSS. Kontrol penuh desain Cosmic theme. Bundle lebih kecil. |
| **Validasi** | Zod v4 | Valibot, Yup | Schema yang sama dipakai di client DAN server. TypeScript inference terbaik. |
| **Testing** | Vitest + fast-check | Jest, Playwright | Vitest lebih cepat untuk Next.js. fast-check menemukan edge case yang unit test biasa tidak temukan. |
| **Deploy** | Vercel (monorepo) | Pisah BE Railway + FE Vercel | Untuk 30-40 user, overhead pisah deployment tidak sepadan. Server Actions menggantikan REST API. |
| **State Management** | React useState (lokal) | Zustand, Redux, Jotai | Session dikelola Supabase. Data server di-fetch ulang via revalidatePath. Tidak butuh global state. |
| **Connection Pooling** | PgBouncer (port 6543) | Direct connection | Vercel serverless bisa spawn banyak instance. Direct connection overflow Supabase free tier (max 60 conn). |

---

*Dokumen ini di-generate secara otomatis dari source code proyek. Terakhir diperbarui: September 2026.*
