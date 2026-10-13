'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  Calendar,
  BookOpen,
  Megaphone,
  CheckSquare,
  Image as ImageIcon,
  MessageSquare,
  User,
  Settings,
  Users,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  LogIn,
} from 'lucide-react';
import type { PublicProfile } from '@/actions/profile.actions';
import LogoutButton from '@/components/auth/LogoutButton';

/** Minimal user shape needed by the sidebar — compatible with User & PublicProfile. */
type SidebarUser = Pick<PublicProfile, 'id' | 'name' | 'avatarUrl' | 'role'>;

interface SidebarProps {
  currentUser: SidebarUser | null;
  allUsers?: SidebarUser[];
}

const userNavItems = [
  { name: 'Beranda', href: '/', icon: Home, guestAllowed: true },
  { name: 'Keuangan Kas', href: '/kas', icon: Wallet, guestAllowed: false },
  { name: 'Jadwal & Tugas', href: '/jadwal', icon: Calendar, guestAllowed: false },
  { name: 'Materi & Modul', href: '/materi', icon: BookOpen, guestAllowed: false },
  { name: 'Pengumuman', href: '/pengumuman', icon: Megaphone, guestAllowed: false },
  { name: 'Presensi', href: '/presensi', icon: CheckSquare, guestAllowed: false },
  { name: 'Galeri Momen', href: '/galeri', icon: ImageIcon, guestAllowed: true },
  { name: 'Forum Diskusi', href: '/forum', icon: MessageSquare, guestAllowed: false },
  { name: 'Profil Saya', href: '/profil', icon: User, guestAllowed: false },
];

const adminNavItems = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Settings },
  { name: 'Kelola Kas', href: '/admin/kas', icon: Wallet },
  { name: 'Kelola Jadwal', href: '/admin/jadwal', icon: Calendar },
  { name: 'Kelola Materi', href: '/admin/materi', icon: BookOpen },
  { name: 'Kelola Pengumuman', href: '/admin/pengumuman', icon: Megaphone },
  { name: 'Kelola Presensi', href: '/admin/presensi', icon: CheckSquare },
  { name: 'Kelola Galeri', href: '/admin/galeri', icon: ImageIcon },
  { name: 'Moderasi Forum', href: '/admin/forum', icon: MessageSquare },
  { name: 'Kelola Anggota', href: '/admin/users', icon: Users },
];

/** Role badge styles — semantic tokens */
const roleColors: Record<string, string> = {
  admin:     'bg-danger-50 text-danger-700 border border-danger-700/20',
  bendahara: 'bg-warning-50 text-warning-700 border border-warning-700/20',
  murid:     'bg-primary-50 text-primary-700 border border-primary-700/20',
  guest:     'bg-neutral-100 text-neutral-600 border border-neutral-300',
};

interface SidebarNavContentProps {
  pathname: string;
  adminExpanded: boolean;
  setAdminExpanded: (val: boolean) => void;
  onCloseMobile: () => void;
  displayName: string;
  displayRole: string;
  displayAvatar: string;
  isGuest: boolean;
}

function SidebarNavContent({
  pathname,
  adminExpanded,
  setAdminExpanded,
  onCloseMobile,
  displayName,
  displayRole,
  displayAvatar,
  isGuest,
}: SidebarNavContentProps) {
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const visibleNavItems = isGuest
    ? userNavItems.filter((item) => item.guestAllowed)
    : userNavItems;

  const isPrivileged = displayRole === 'admin' || displayRole === 'bendahara';

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--surface)' }}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="block text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            RPL 1
          </span>
          <span className="block text-xs text-neutral-500 -mt-0.5 tracking-widest uppercase">
            2026/2027
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Menu Utama
        </p>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-[120ms] ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors duration-[120ms] ${
                  active ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'
                }`}
              />
              <span>{item.name}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600" />}
            </Link>
          );
        })}

        {/* Guest login prompt */}
        {isGuest && (
          <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
            <p className="text-sm text-neutral-600 mb-3">
              Login untuk akses penuh ke semua fitur kelas.
            </p>
            <Link
              href="/login"
              onClick={onCloseMobile}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors duration-[120ms]"
            >
              <LogIn size={14} />
              <span>Masuk / Login</span>
            </Link>
          </div>
        )}

        {/* Admin section */}
        {isPrivileged && (
          <div className="pt-4">
            <button
              onClick={() => setAdminExpanded(!adminExpanded)}
              className="flex w-full items-center justify-between px-2 mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors duration-[120ms] cursor-pointer"
            >
              <span>Manajemen Admin</span>
              <ChevronRight
                size={12}
                className={`transition-transform duration-200 ${adminExpanded ? 'rotate-90' : ''}`}
              />
            </button>

            {adminExpanded && (
              <div className="space-y-0.5 animate-slide-up">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-[120ms] ${
                        active
                          ? 'bg-danger-50 text-danger-700'
                          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          active ? 'text-danger-700' : 'text-neutral-400 group-hover:text-neutral-500'
                        }`}
                      />
                      <span className="text-xs">{item.name}</span>
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-danger-700" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User badge */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid var(--border)' }}>
        {isGuest ? (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 ring-2 ring-neutral-200 shrink-0">
                <User size={18} className="text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-700 truncate">Tamu</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize ${roleColors.guest}`}>
                    guest
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/login"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors duration-[120ms]"
            >
              <LogIn size={14} />
              <span>Masuk ke Akun</span>
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize ${
                      roleColors[displayRole] ?? roleColors.murid
                    }`}
                  >
                    {displayRole}
                  </span>
                </div>
              </div>
            </div>
            <LogoutButton className="mt-2" />
          </>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

  if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/auth')) {
    return null;
  }

  const isGuest = currentUser === null;
  const displayName = currentUser?.name ?? 'Tamu';
  const displayRole = currentUser?.role ?? 'guest';
  const displayAvatar =
    currentUser?.avatarUrl ??
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80';

  const contentProps = {
    pathname,
    adminExpanded,
    setAdminExpanded,
    onCloseMobile: () => setMobileOpen(false),
    displayName,
    displayRole,
    displayAvatar,
    isGuest,
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-header shadow-md"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarNavContent {...contentProps} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-header flex h-14 items-center justify-between px-4 backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900">
            RPL 1
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors duration-[120ms]"
            >
              <LogIn size={14} />
              <span>Login</span>
            </Link>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-primary-200"
              />
              <span className="text-sm font-semibold text-neutral-700">{displayName}</span>
            </>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors duration-[120ms] cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-modal bg-black/40 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="lg:hidden fixed inset-y-0 left-0 z-modal w-72 animate-slide-up motion-reduce:animate-none shadow-lg"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-[120ms] cursor-pointer"
            >
              <X size={18} />
            </button>
            <SidebarNavContent {...contentProps} />
          </div>
        </>
      )}
    </>
  );
}
