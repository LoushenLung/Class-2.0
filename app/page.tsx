import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Wallet,
  Megaphone,
  CheckCircle,
  FileText,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/actions/guards';
import { getScheduleSlots } from '@/actions/schedule.actions';
import { getAnnouncements } from '@/actions/announcement.actions';
import { getAttendanceStats } from '@/actions/attendance.actions';
import { getPublicProfiles } from '@/actions/profile.actions';

export default async function HomePage() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [currentUser, slots, announcements, attendanceResult, profiles] =
    await Promise.all([
      getCurrentUser(),
      getScheduleSlots(),
      getAnnouncements(),
      getAttendanceStats(todayStr),
      getPublicProfiles(),
    ]);

  const attendance = attendanceResult.success
    ? attendanceResult.data
    : { attendanceRate: 0, presentCount: 0, studentsCount: 0 };

  const now = new Date();
  const jsDow = now.getDay();
  const todayDow = jsDow === 0 ? 0 : Math.min(jsDow - 1, 4);
  const todaySlots = slots
    .filter((s) => s.dayOfWeek === todayDow && !s.isBreak)
    .sort((a, b) => a.periodOrder - b.periodOrder);

  const targetDate = new Date('2026-10-12T08:00:00');
  const diffDays = Math.max(
    0,
    Math.ceil((targetDate.getTime() - now.getTime()) / 86_400_000)
  );

  const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
  const currentDayName = DAY_NAMES[now.getDay() === 0 ? 6 : now.getDay() - 1] ?? 'Hari Ini';

  const publishedAnnouncements = announcements.filter((a) => a.status === 'published');

  /** Radius of the attendance donut */
  const R = 40;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - attendance.attendanceRate / 100);

  return (
    <div className="space-y-8 animate-fade-in motion-reduce:animate-none">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm px-6 py-10 md:px-10 md:py-12">
        {/* Subtle blue tint blob */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-50 opacity-60 blur-3xl" />

        <div className="relative z-raised grid gap-8 md:grid-cols-2 md:items-center">
          {/* Text block */}
          <div className="space-y-4">
            {/* Greeting badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 ring-1 ring-primary-200">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              {currentUser ? `Halo, ${currentUser.name}!` : 'Selamat Datang di Web Kelas RPL 1'}
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-neutral-900">
              Web Kelas Digital{' '}
              <span className="text-primary-600">RPL 1</span>{' '}
              <span className="text-neutral-400">2026/2027</span>
            </h1>

            <p className="max-w-md text-base text-neutral-600">
              Pusat informasi, transparansi kas kelas, koordinasi akademik, dan album kenangan bersama.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/kas"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors duration-[120ms]"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Lihat Kas
              </Link>
              <Link
                href="/jadwal"
                className="inline-flex h-11 items-center justify-center rounded-md border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-[120ms]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Lihat Jadwal
              </Link>
            </div>
          </div>

          {/* Countdown card */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Countdown UTS Semester 1
            </span>
            <div className="mt-4 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold tabular-nums text-neutral-900">{diffDays}</span>
              <span className="text-lg font-medium text-neutral-500">Hari Lagi</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-neutral-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Target Mulai: 12 Oktober 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Guest CTA banner ── */}
      {!currentUser && (
        <div className="relative overflow-hidden rounded-xl border border-primary-200 bg-primary-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up motion-reduce:animate-none">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Kamu sedang menjelajah sebagai Tamu</p>
            <p className="text-sm text-neutral-600 mt-0.5">
              Login untuk mengakses kas, jadwal, forum, presensi, dan fitur lainnya.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors duration-[120ms] shrink-0"
          >
            Masuk ke Akun
          </Link>
        </div>
      )}

      {/* ── Bento grid ── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Announcements — spans 2 cols */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col md:col-span-2">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
              <Megaphone className="h-5 w-5 text-primary-500" />
              Pengumuman Terbaru
            </h2>
            <Link href="/pengumuman" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-[120ms]">
              Semua →
            </Link>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {publishedAnnouncements.slice(0, 3).length > 0 ? (
              publishedAnnouncements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 hover:border-primary-200 hover:bg-primary-50 transition-all duration-[120ms]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-primary-200">
                      Pengumuman
                    </span>
                    <span className="text-xs text-neutral-400">
                      {ann.publishedAt
                        ? new Date(ann.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                        : new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{ann.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{ann.content}</p>
                </div>
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center text-neutral-400">
                <AlertCircle className="h-8 w-8 stroke-1 text-neutral-300 mb-2" />
                <p className="text-sm">Tidak ada pengumuman</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
              <Calendar className="h-5 w-5 text-primary-500" />
              Hari Ini <span className="text-neutral-400 font-normal text-sm">({currentDayName})</span>
            </h2>
            <Link href="/jadwal" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-[120ms]">
              Lengkap →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {todaySlots.length > 0 ? (
              todaySlots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary-600">{slot.periodLabel}</span>
                    <span className="text-neutral-400">{slot.room}</span>
                  </div>
                  <h3 className="mt-1 font-semibold text-neutral-900 text-sm">{slot.subject ?? '-'}</h3>
                  {slot.teacher && <p className="text-xs text-neutral-500 mt-0.5">{slot.teacher}</p>}
                </div>
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center text-neutral-400">
                <CheckCircle className="h-8 w-8 stroke-1 text-neutral-300 mb-2" />
                <p className="text-sm">Tidak ada jadwal hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Kehadiran Hari Ini
            </h2>
            <Link href="/presensi" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-[120ms]">
              Presensi →
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" aria-hidden="true">
                <circle cx="48" cy="48" r={R} stroke="currentColor" strokeWidth="8" className="text-neutral-100" fill="transparent" />
                <circle
                  cx="48" cy="48" r={R} stroke="currentColor" strokeWidth="8"
                  className="text-primary-500"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round" fill="transparent"
                  style={{ transition: 'stroke-dashoffset var(--duration-slow) var(--ease-out-soft)' }}
                />
              </svg>
              <span className="absolute text-lg font-bold text-neutral-900">{attendance.attendanceRate}%</span>
            </div>
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-900">{attendance.presentCount}</span> dari{' '}
              <span className="font-semibold text-neutral-900">{attendance.studentsCount}</span> siswa hadir
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
              <ExternalLink className="h-5 w-5 text-primary-500" />
              Akses Cepat
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { href: '/materi', icon: FileText, label: 'Perpustakaan' },
              { href: '/forum', icon: MessageCircle, label: 'Forum Diskusi' },
              { href: '/galeri', icon: Sparkles, label: 'Galeri' },
              { href: '/kas', icon: Wallet, label: 'Kas Kelas' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center hover:border-primary-200 hover:bg-primary-50 hover:shadow-sm transition-all duration-[120ms] group"
              >
                <Icon className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors duration-[120ms]" />
                <span className="text-xs font-medium text-neutral-600 group-hover:text-primary-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Class members */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="pb-4 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
              <Users className="h-5 w-5 text-primary-500" />
              Anggota Kelas
              <span className="ml-auto inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                {profiles.length}
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profiles.slice(0, 10).map((user) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={user.id}
                src={user.avatarUrl ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                alt={user.name}
                title={user.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ))}
            {profiles.length > 10 && (
              <div className="h-9 w-9 rounded-full bg-primary-50 ring-2 ring-white shadow-sm flex items-center justify-center text-xs font-semibold text-primary-600">
                +{profiles.length - 10}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
