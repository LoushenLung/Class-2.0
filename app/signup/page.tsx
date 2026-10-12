'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  MailCheck,
} from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '@/actions/auth.actions';

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage('Konfirmasi kata sandi tidak sama.');
      return;
    }

    startTransition(async () => {
      const res = await signUpWithEmail({
        name,
        email,
        password,
        passwordConfirmation,
        next,
      });

      if (res.success) {
        if (res.data.status === 'signed_in') {
          router.push(res.data.redirectTo);
          router.refresh();
        } else {
          setConfirmationSent(true);
        }
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setIsGooglePending(true);
    try {
      const res = await signInWithGoogle({ next });
      if (res.success) {
        window.location.href = res.data.url;
      } else {
        setErrorMessage(res.error);
        setIsGooglePending(false);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menghubungkan ke Google.');
      setIsGooglePending(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <MailCheck className="h-8 w-8 animate-bounce" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">Konfirmasi Email Terkirim</h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            Kami telah mengirimkan tautan verifikasi ke{' '}
            <span className="font-semibold text-white">{email}</span>. Silakan periksa kotak
            masuk atau folder spam Anda dan klik tautan verifikasi untuk mulai menggunakan akun.
          </p>

          <div className="mt-8">
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer"
            >
              <span>Kembali ke Halaman Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Registrasi Akun Siswa RPL 1</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-white to-blue-400 bg-clip-text text-transparent">
          Buat Akun Baru
        </h1>
        <p className="text-sm text-slate-400">
          Daftarkan akun untuk bergabung dan mengakses seluruh fitur portal kelas RPL 1.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isPending || isGooglePending}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/60 py-3 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isGooglePending ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Daftar dengan Google</span>
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            atau daftar dengan email
          </span>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Fauzi"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@siswa.belajar.id"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Kata Sandi (Min. 8 Karakter)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Confirmation Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || isGooglePending}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 px-4 text-sm font-bold text-white hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <>
                <span>Daftar Akun</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sudah punya akun?{' '}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
            className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Masuk sekarang
          </Link>
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-indigo-400" />
        <span>Sistem Otentikasi Terproteksi Supabase RLS</span>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B1A] p-4 overflow-y-auto min-h-screen">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-sm text-slate-400">Memuat halaman pendaftaran...</p>
          </div>
        }
      >
        <SignUpFormContent />
      </Suspense>
    </div>
  );
}
