# AGENTS_GUIDE.md — AI Agent Instruction Manual
## Web Kelas RPL 1 (`class-rpl-1-202627`)

> **Dokumen ini adalah panduan operasional untuk AI agent.**
> Bukan deskripsi proyek — tapi instruksi eksplisit tentang bagaimana bekerja di codebase ini.
> Baca ini sebelum menyentuh satu baris kode pun.

---

## BAGIAN 1: Orientasi — Baca Ini Pertama

### 1.1 Urutan Baca Wajib

Sebelum menulis kode apapun, baca dokumen berikut **dalam urutan ini**:

```
1. docs/PROJECT_OVERVIEW.md   — gambaran lengkap proyek
2. 00-project-constitution.md  — jiwa & constraint proyek
3. 01-architecture.md          — arsitektur teknis
4. 02-frontend-guide.md        — panduan UI/UX
5. 03-design-system.md         — panduan visual Cosmic theme
6. 04-file-conventions.md      — konvensi file & folder
7. CODING_STANDARDS.md         — standar kode
```

### 1.2 Identitas Proyek

- **Nama**: `class-rpl-1-202627`
- **Tujuan**: Web rumah digital kelas RPL 1 — bukan sistem ERP
- **Stack final**: Next.js 16 App Router + Supabase + Prisma + Cloudinary + Tailwind v4
- **Deploy**: Vercel (FE+BE satu package) + Supabase (DB+Auth)
- **Skala**: ~30-40 siswa, free tier semua layanan

### 1.3 Tiga Pertanyaan Sebelum Mulai Kode

Sebelum menulis kode, jawab tiga pertanyaan ini:

1. **Apakah fitur ini sudah ada?** — cari di `actions/`, `lib/validations/`, `app/`
2. **Apakah ada pola yang sama di codebase?** — ikuti pola yang sudah ada
3. **Apakah perlu library baru?** — jika ya, **STOP dan tanya manusia**

---

## BAGIAN 2: Larangan Keras

Hal-hal yang **DILARANG** tanpa izin eksplisit dari manusia:

```
❌ Install library UI baru (shadcn, radix, headlessui, dll)
❌ Ganti Prisma dengan ORM lain (Drizzle, Kysely, dll)
❌ Tambah state manager (Zustand, Redux, Jotai, dll)
❌ Buat API Route (/api/*) untuk data yang bisa diambil via Server Component
❌ Gunakan `any` dalam TypeScript — gunakan `unknown` + Zod narrowing
❌ Ambil authorId/userId dari user input — selalu dari requireAuth()
❌ Skip requireAuth() atau requireRole() di Server Action
❌ Buat fungsi formatCurrency/formatDate/formatError baru — pakai yang di lib/utils.ts
❌ Deklarasi komponen React di dalam render loop komponen lain
❌ Hardcode credential/secret di kode — selalu dari environment variable
❌ Commit file .env atau .env.local
```

---

## BAGIAN 3: Pola Wajib

### 3.1 Pola Server Action — SEMUA mutasi data HARUS ikuti ini

```ts
'use server';

export async function namaAction(input: unknown): Promise<ActionResult<T>> {
  // Step 1: Auth guard — SELALU pertama
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;
  const { user } = authResult;

  // Step 2: Role guard — jika operasi butuh peran khusus
  const roleResult = requireRole(user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  // Step 3: Validasi input dengan Zod
  const parsed = nanaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
    };
  }

  // Step 4: (Jika ada file) Upload ke Cloudinary SEBELUM DB
  // Jika Cloudinary gagal → return error, DB TIDAK disentuh

  // Step 5: Operasi database dengan Prisma
  try {
    const result = await prisma.model.create({ data: { ... } });

    // Step 6: Revalidate cache untuk semua path yang terdampak
    revalidatePath('/path');
    revalidatePath('/admin/path');

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}
```

### 3.2 Pola File Upload Atomik

```ts
// ✅ POLA WAJIB untuk upload file
// 1. Validasi MIME type & ukuran dulu
// 2. Upload Cloudinary
// 3. Insert DB
// Jika step 3 gagal: log error dengan cloudinaryId, return failure

let cloudinaryUrl: string;
let cloudinaryId: string;
try {
  const result = await uploadToCloudinary(buffer, FOLDER_NAME);
  cloudinaryUrl = result.url;
  cloudinaryId = result.publicId;
} catch (err) {
  return { success: false, error: formatError(err) };
}

try {
  const record = await prisma.model.create({
    data: { cloudinaryUrl, cloudinaryId, ... }
  });
  revalidatePath('/path');
  return { success: true, data: record };
} catch (err) {
  // Cloudinary asset ada tapi DB gagal — log untuk cleanup manual
  console.error('[namaAction] DB insert gagal setelah upload.', { cloudinaryId }, err);
  return { success: false, error: formatError(err) };
}
```

### 3.3 Pola Halaman (page.tsx)

```tsx
// Server Component (DEFAULT — tidak ada "use client")
// page.tsx hanya untuk: fetch data + render + pass ke Client Component

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/actions/guards';
import { getNamaData } from '@/actions/nama.actions';
import { NamaClient } from './_components/NamaClient';

export default async function NamaPage() {
  // Auth check di page level (backup, middleware sudah handle ini)
  const authResult = await requireAuth();
  if (!authResult.ok) redirect('/login');

  // Fetch data langsung di server
  const data = await getNamaData();

  // Pass data ke Client Component
  return <NamaClient data={data} user={authResult.user} />;
}
```

### 3.4 Pola Client Component

```tsx
// _components/NamaClient.tsx
'use client';  // HANYA jika butuh state/event handler

import { useState, useTransition } from 'react';
import { namaAction } from '@/actions/nama.actions';
import type { TipeData } from '@/lib/types';

interface NamaClientProps {
  data: TipeData[];
  user: CurrentUser;
}

export function NamaClient({ data, user }: NamaClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await namaAction({ field: formData.get('field') });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      // UI update otomatis karena revalidatePath di server action
    });
  }

  return (
    <form action={handleSubmit}>
      {error && <p className="text-rose-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="h-11 ..."
      >
        {isPending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}
```

### 3.5 Pola Zod Schema

```ts
// lib/validations/nama.ts
// HANYA berisi Zod schema dan type inference — tidak ada DB query di sini

import { z } from 'zod';

export const createNamaSchema = z.object({
  field: z
    .string()
    .min(1, 'Field wajib diisi.')          // pesan error dalam Bahasa Indonesia
    .max(200, 'Field maksimal 200 karakter.'),
  angka: z
    .number()
    .int('Harus bilangan bulat.')
    .min(1, 'Harus lebih dari 0.'),
});

export type CreateNamaInput = z.infer<typeof createNamaSchema>;
```

---

## BAGIAN 4: Struktur File yang Benar

### 4.1 Di mana taruh file baru

| Jenis file | Lokasi | Nama |
|------------|--------|------|
| Server Action domain baru | `actions/` | `domain.actions.ts` |
| Zod schema domain baru | `lib/validations/` | `domain.ts` |
| Halaman baru | `app/nama-route/` | `page.tsx` |
| Client Component halaman | `app/nama-route/_components/` | `NamaClient.tsx` |
| Client Component admin | `app/admin/modul/_components/` | `AdminModulCRUD.tsx` |
| Reusable component global | `components/shared/` | `NamaComponent.tsx` |
| Tipe baru | `lib/types.ts` | (tambahkan di file yang ada) |
| Utility function baru | `lib/utils.ts` | (tambahkan di file yang ada) |

### 4.2 Yang TIDAK boleh dibuat

```
❌ actions/namaAction.ts         — harus domain.actions.ts
❌ app/halaman/Form.tsx          — form client harus di _components/
❌ lib/helper-namaFitur.ts       — tambahkan ke lib/utils.ts yang ada
❌ components/namaComponent.tsx  — harus di components/shared/ atau _components/
❌ types/nama.ts                 — semua tipe di lib/types.ts
```

---

## BAGIAN 5: Aturan TypeScript

### 5.1 Zero `any` — wajib

```ts
// ❌ DILARANG
function process(data: any) { ... }

// ✅ Gunakan unknown + Zod
function process(data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return;
  // parsed.data sekarang fully typed
}
```

### 5.2 Return type eksplisit untuk Server Action

```ts
// ✅ Selalu deklarasi return type
export async function createThing(input: unknown): Promise<ActionResult<Thing>> {
  ...
}

// ❌ Implicit return type
export async function createThing(input: unknown) {
  ...
}
```

### 5.3 Gunakan tipe dari lib/types.ts

```ts
// ✅ Import dari centralized types
import type { ActionResult, CurrentUser, UserRole } from '@/lib/types';
import type { User, ForumPost } from '@/lib/types';  // re-export dari Prisma

// ❌ Import Prisma types langsung di business logic
import type { User } from '@prisma/client';
```

---

## BAGIAN 6: Aturan UI

### 6.1 Warna & Tema

Hanya gunakan warna dari sistem Cosmic Deep Space. **Jangan pernah** menggunakan warna yang tidak ada di `03-design-system.md`.

```tsx
// ✅ BENAR — warna dari design system
className="bg-[#0B0B1A]"                    // background
className="bg-[#15152D]/80 backdrop-blur-md" // card glass
className="from-purple-600 to-indigo-600"    // gradient aksen
className="text-emerald-400"                 // status lunas/hadir
className="text-amber-400"                   // status pending
className="text-rose-400"                    // status error/overdue

// ❌ SALAH — warna random
className="bg-blue-500"
className="text-green-600"
```

### 6.2 State interaksi wajib

Setiap aksi user WAJIB punya 3 state:

```tsx
// ✅ WAJIB ada ketiga state ini
// 1. Default
<button className="...">Simpan</button>

// 2. Loading/pending
<button disabled className="... opacity-50 cursor-not-allowed">
  <span className="animate-spin mr-2">⟳</span>
  Menyimpan...
</button>

// 3. Error — tampilkan di bawah field atau atas form
{error && (
  <p className="text-rose-400 text-sm mt-1">{error}</p>
)}
```

### 6.3 Empty state wajib

```tsx
// ✅ Jangan tampilkan halaman kosong
{data.length === 0 && (
  <div className="flex flex-col items-center py-16 text-slate-400">
    <IconNama className="h-12 w-12 mb-4 opacity-30" />
    <p className="text-sm">Belum ada data yang ditambahkan.</p>
  </div>
)}
```

### 6.4 Mobile-first — wajib

```tsx
// ✅ Base style untuk mobile, override untuk desktop
className="flex flex-col gap-3 md:flex-row md:gap-6"
className="text-sm md:text-base"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// ❌ Desktop-first (jangan)
className="flex flex-row gap-6"  // tidak ada fallback mobile
```

---

## BAGIAN 7: Aturan Database & Query

### 7.1 Select field minimal

```ts
// ✅ Pilih hanya yang dibutuhkan
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, role: true },
});

// ❌ Ambil semua field
const user = await prisma.user.findUnique({ where: { id } });
```

### 7.2 Parallelkan query yang independen

```ts
// ✅ Paralel
const [a, b] = await Promise.all([
  prisma.model.count({ where: ... }),
  prisma.other.findMany({ where: ... }),
]);

// ❌ Sequential
const a = await prisma.model.count(...);
const b = await prisma.other.findMany(...);
```

### 7.3 Tidak boleh expose technical error ke user

```ts
// ✅ Gunakan formatError — menyaring error message yang aman
return { success: false, error: formatError(err) };

// ❌ Expose raw error
return { success: false, error: err.message };  // bisa expose table/column name
```

---

## BAGIAN 8: Checklist Sebelum Selesai

Sebelum menyatakan task selesai, verifikasi semua item ini:

### Code Quality
- [ ] Zero `any` — tidak ada tipe `any` di kode baru
- [ ] Semua Server Action punya `requireAuth()` di baris pertama
- [ ] Server Action yang butuh role punya `requireRole()` setelah `requireAuth()`
- [ ] Semua input divalidasi dengan Zod sebelum ke DB
- [ ] Return type eksplisit di semua Server Action
- [ ] Import menggunakan path alias `@/...` bukan relative path panjang

### UI/UX
- [ ] Loading state ada di semua tombol aksi
- [ ] Error state ditampilkan dengan pesan Bahasa Indonesia
- [ ] Empty state ada untuk semua list yang bisa kosong
- [ ] Tampilan dicek di lebar 360px (mobile)
- [ ] Touch target minimal 44px untuk semua elemen interaktif
- [ ] Warna mengikuti design system Cosmic

### File Structure
- [ ] Client Component ada di folder `_components/`
- [ ] Tidak ada komponen React yang dideklarasi di dalam render loop
- [ ] Validation schema di `lib/validations/`, bukan di action file
- [ ] Tipe baru ditambahkan ke `lib/types.ts`

### Security
- [ ] `authorId`/`userId` diambil dari session, bukan dari input
- [ ] Tidak ada credential/secret yang di-hardcode
- [ ] File upload: MIME type dan ukuran divalidasi sebelum upload Cloudinary
- [ ] Role-sensitive endpoint: `requireRole()` ada

### Performance
- [ ] Halaman baru adalah Server Component (bukan Client Component) jika tidak butuh interaktivitas
- [ ] `next/image` digunakan untuk semua tag `<img>`
- [ ] `revalidatePath` hanya dipanggil untuk path yang benar-benar terdampak
- [ ] Query DB menggunakan `select` untuk field yang diperlukan saja

---

## BAGIAN 9: Cara Menangani Situasi Ambigu

### Jika instruksi task bertentangan dengan dokumen ini
→ **STOP. Tanya manusia. Dokumen ini menang.**

### Jika tidak tahu di mana taruh sebuah file
→ Cari pola serupa di codebase. Ikuti pola yang ada.

### Jika perlu library baru
→ **STOP. Jelaskan kenapa butuh library itu, apa alternatifnya, tanya manusia.**

### Jika tidak yakin dengan query Prisma yang efisien
→ Tulis query yang benar dulu, tambahkan komentar `// TODO: optimize dengan index` jika perlu.

### Jika ada dua cara yang sama-sama valid
→ Pilih cara yang lebih sedikit kodenya, lebih mudah dibaca, dan lebih dekat dengan pola yang sudah ada di codebase.

### Jika diminta membuat fitur yang ada di "Won't Have" list
→ **STOP. Ingatkan manusia bahwa fitur ini ada di daftar Won't Have. Minta konfirmasi eksplisit.**

---

## BAGIAN 10: Quick Reference — Yang Sudah Ada, Gunakan Ini

### Utility Functions (`lib/utils.ts`)
```ts
formatError(err: unknown): string     // konversi error ke string aman
formatCurrency(amount: number): string // format ke "Rp 50.000"
formatDate(date: ...): string          // format ke tanggal Indonesia
```

### Auth Guards (`lib/actions/guards.ts`)
```ts
requireAuth(): Promise<AuthResult>
requireRole(user: CurrentUser, roles: UserRole[]): RoleResult
```

### Cloudinary Helper (`lib/cloudinary.ts`)
```ts
uploadToCloudinary(buffer: Buffer, folder: string): Promise<{ url, publicId }>
deleteFromCloudinary(publicId: string): Promise<void>

// Folder constants:
GALLERY_FOLDER  // untuk foto galeri
PROOF_FOLDER    // untuk bukti bayar
MATERI_FOLDER   // untuk file materi
AVATAR_FOLDER   // untuk avatar
```

### Supabase Client
```ts
// Server Component / Server Action:
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client Component (jarang dibutuhkan):
import { createClient } from '@/lib/supabase/client';
```

### Prisma Client
```ts
import { prisma } from '@/lib/db';
// Gunakan langsung — sudah singleton
```

### Types
```ts
import type {
  ActionResult,     // { success: true, data: T } | { success: false, error: string }
  CurrentUser,      // user dari requireAuth()
  UserRole,         // "admin" | "bendahara" | "murid"
  AttendanceStatus, // "HADIR" | "IZIN" | "SAKIT" | "ALFA"
  PaymentStatus,    // "pending" | "paid" | "overdue"
  // ... semua Prisma model types
} from '@/lib/types';
```

---

*Dokumen ini adalah panduan operasional untuk AI agent yang bekerja di codebase class-rpl-1-202627.*
*Terakhir diperbarui: September 2026.*
