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

  const attendance = attendanceResult.success ? attendanceResult.data : { attendanceRate: 0, presentCount: 0, studentsCount: 0 };

  // Today's day of week: JS getDay() → 0=Sun … convert to Mon=0 … Fri=4
  const now = new Date();
  const jsDow = now.getDay();
  const todayDow = jsDow === 0 ? 0 : Math.min(jsDow - 1, 4);
  const todaySlots = slots
    .filter((s) => s.dayOfWeek === todayDow && !s.isBreak)
    .sort((a, b) => a.periodOrder - b.periodOrder);

  // Countdown to UTS
  const targetDate = new Date('2026-10-12T08:00:00');
  const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / 86_400_000));

  const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
  const currentDayName = DAY_NAMES[now.getDay() === 0 ? 6 : now.getDay() - 1] ?? 'Hari Ini';

  const publishedAnnouncements = announcements.filter((a) => a.status === 'published');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0B1A] via-[#15152D] to-purple-950 px-6 py-12 text-white shadow-[0_0_40px_rgba(138,43,226,0.15)] border border-purple-500/20 md:px-12 md:py-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3.5 py-1 text-xs font-semibold text-purple-300 ring-1 ring-purple-500/30">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              {currentUser ? `Halo, ${currentUser.name}!` : 'Selamat Datang di Hub RPL 1'}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Web Kelas Digital{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                RPL 1 2026/2027
              </span>
            </h1>
            <p className="max-w-md text-sm text-slate-300">
              Pusat informasi, transparansi kas kelas, koordinasi akademik, dan album kenangan bersama.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/kas"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 text-sm font-bold text-white shadow-[0_0_15px_rgba(138,43,226,0.5)] hover:from-purple-500 hover:to-blue-500 transition-all cursor-pointer"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Lihat Kas
              </Link>
              <Link
                href="/jadwal"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-5 text-sm font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Lihat Jadwal
              </Link>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Countdown UTS Semester 1
            </span>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="text-5xl font-black tabular-nums tracking-tight text-white">{diffDays}</span>
              <span className="text-lg font-semibold text-slate-300">Hari Lagi</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Target Mulai: 12 Oktober 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guest CTA Banner */}
      {!currentUser && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="relative z-10 text-center sm:text-left">
            <p className="text-sm font-bold text-white">Kamu sedang menjelajah sebagai Tamu</p>
            <p className="text-xs text-slate-400 mt-0.5">Login untuk mengakses kas, jadwal, forum, presensi, dan fitur lainnya.</p>
          </div>
          <Link
            href="/login"
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-blue-500 transition-all shrink-0"
          >
            Masuk ke Akun
          </Link>
        </div>
      )}

      {/* Bento grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Announcements */}
        <div className="rounded-3xl border border-white/10 bg-[#15152D]/80 backdrop-blur-md p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-white flex flex-col md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <Megaphone className="h-5 w-5 text-indigo-400" />
              Pengumuman Terbaru
            </h2>
            <Link href="/pengumuman" className="text-xs font-semibold text-indigo-400 hover:underline">
              Semua
            </Link>
          </div>
          <div className="mt-4 flex-1 space-y-4">
            {publishedAnnouncements.slice(0, 3).length > 0 ? (
              publishedAnnouncements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase">Pengumuman</span>
                    <span className="text-[10px] text-slate-400">
                      {ann.publishedAt
                        ? new Date(ann.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                        : new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{ann.content}</p>
                </div>
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center text-slate-400">
                <AlertCircle className="h-8 w-8 stroke-1 text-slate-500 mb-2" />
                <p className="text-xs">Tidak ada pengumuman</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="rounded-3xl border border-white/10 bg-[#15152D]/80 backdrop-blur-md p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-white">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Hari Ini ({currentDayName})
            </h2>
            <Link href="/jadwal" className="text-xs font-semibold text-indigo-400 hover:underline">
              Lengkap
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {todaySlots.length > 0 ? (
              todaySlots.map((slot) => (
                <div key={slot.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300">{slot.periodLabel}</span>
                    <span className="text-slate-400">{slot.room}</span>
                  </div>
                  <h3 className="mt-1 font-bold text-white text-sm">{slot.subject ?? '-'}</h3>
                  {slot.teacher && <p className="text-[11px] text-slate-400 mt-0.5">{slot.teacher}</p>}
                </div>
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center text-slate-400">
                <CheckCircle className="h-8 w-8 stroke-1 text-slate-500 mb-2" />
                <p className="text-xs">Tidak ada jadwal hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance widget */}
        <div className="rounded-3xl border border-white/10 bg-[#15152D]/80 backdrop-blur-md p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-white">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle className="h-5 w-5 text-indigo-400" />
              Kehadiran Hari Ini
            </h2>
            <Link href="/presensi" className="text-xs font-semibold text-indigo-400 hover:underline">
              Presensi
            </Link>
          </div>
          <div className="mt-4 space-y-4 text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-24 w-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-700" fill="transparent" />
                <circle
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8"
                  className="text-indigo-500"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - attendance.attendanceRate / 100)}
                  strokeLinecap="round" fill="transparent"
                />
              </svg>
              <span className="absolute text-lg font-black text-white">{attendance.attendanceRate}%</span>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-bold text-white">{attendance.presentCount}</span> dari{' '}
              <span className="font-bold text-white">{attendance.studentsCount}</span> siswa hadir.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-3xl border border-white/10 bg-[#15152D]/80 backdrop-blur-md p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-white">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <ExternalLink className="h-5 w-5 text-indigo-400" />
              Akses Cepat
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/materi" className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center hover:scale-[1.02] transition-transform">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span className="text-[10px] font-bold">Perpustakaan</span>
            </Link>
            <Link href="/forum" className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center hover:scale-[1.02] transition-transform">
              <MessageCircle className="h-5 w-5 text-indigo-400" />
              <span className="text-[10px] font-bold">Forum Diskusi</span>
            </Link>
            <Link href="/galeri" className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center hover:scale-[1.02] transition-transform">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span className="text-[10px] font-bold">Galeri</span>
            </Link>
            <Link href="/kas" className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center hover:scale-[1.02] transition-transform">
              <Wallet className="h-5 w-5 text-indigo-400" />
              <span className="text-[10px] font-bold">Kas Kelas</span>
            </Link>
          </div>
        </div>

        {/* Org members */}
        <div className="rounded-3xl border border-white/10 bg-[#15152D]/80 backdrop-blur-md p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-white">
          <div className="border-b border-slate-700 pb-4 mb-4">
            <h2 className="font-bold text-lg">Anggota Kelas ({profiles.length})</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profiles.slice(0, 8).map((user) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={user.id}
                src={user.avatarUrl ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                alt={user.name}
                title={user.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ))}
            {profiles.length > 8 && (
              <div className="h-9 w-9 rounded-full bg-indigo-600/20 ring-2 ring-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                +{profiles.length - 8}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
