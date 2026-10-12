'use client';

import React, { useState, useTransition } from 'react';
import type { User, UserRole } from '@/lib/types';
import { updateUserRole, adminUpdateUserProfile } from '@/actions/profile.actions';
import { Shield, Save, X, Edit3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserManagementListProps {
  users: User[];
}

const roleBadges: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-rose-500/20',
  },
  bendahara: {
    label: 'Bendahara',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-amber-500/20',
  },
  murid: {
    label: 'Siswa / Murid',
    className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 ring-indigo-500/20',
  },
};

export default function UserManagementList({ users }: UserManagementListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('murid');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [activeUserUpdating, setActiveUserUpdating] = useState<string | null>(null);

  const startEdit = (user: User) => {
    setFeedback(null);
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditRole((user.role as UserRole) || 'murid');
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setFeedback(null);
  };

  const handleSaveEdit = (userId: string) => {
    setFeedback(null);
    setActiveUserUpdating(userId);

    startTransition(async () => {
      const res = await adminUpdateUserProfile(userId, {
        name: editName,
        role: editRole,
      });

      setActiveUserUpdating(null);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Berhasil memperbarui data ${res.data.name}.`,
        });
        setEditingUserId(null);
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error,
        });
      }
    });
  };

  const handleQuickRoleChange = (userId: string, newRole: UserRole) => {
    setFeedback(null);
    setActiveUserUpdating(userId);

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      setActiveUserUpdating(null);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Role ${res.data.name} berhasil diubah menjadi ${newRole.toUpperCase()}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Daftar Anggota Kelas</h2>
          <p className="text-xs text-slate-400">
            Kelola hak akses anggota (Admin, Bendahara, Siswa) dan sesuaikan profil nama.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 w-fit">
          Total: {users.length} Anggota
        </span>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const isEditing = editingUserId === user.id;
          const isUpdatingThis = activeUserUpdating === user.id && isPending;
          const currentRole = (user.role as UserRole) || 'murid';
          const badge = roleBadges[currentRole] ?? roleBadges.murid;

          return (
            <div
              key={user.id}
              className={`rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900/60 backdrop-blur-md space-y-4 transition-all duration-200 relative overflow-hidden ${
                isEditing
                  ? 'border-indigo-500/60 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/50 dark:border-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Updating overlay spinner */}
              {isUpdatingThis && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2 text-xs font-semibold text-white animate-in fade-in">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Menyimpan...</span>
                </div>
              )}

              {/* User Avatar & Header */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'
                  }
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-950 dark:text-white text-sm truncate">
                    {user.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block truncate">{user.email}</span>
                </div>
              </div>

              {/* Content Form / Details */}
              <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nama Anggota
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nama lengkap"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pilih Role
                      </label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="murid">Siswa / Murid</option>
                        <option value="bendahara">Bendahara</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">
                          Role Saat Ini
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${badge.className}`}
                          >
                            <Shield className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">
                          Bergabung
                        </span>
                        <span className="text-slate-400 text-[11px] block mt-1">
                          {new Date(user.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Role Switcher */}
                    <div className="pt-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Ubah Cepat Role:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['murid', 'bendahara', 'admin'] as UserRole[]).map((r) => {
                          const isActiveRole = currentRole === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleQuickRoleChange(user.id, r)}
                              disabled={isActiveRole || isPending}
                              className={`rounded-lg py-1 px-1.5 text-[10px] font-semibold text-center border transition-all cursor-pointer ${
                                isActiveRole
                                  ? 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60 cursor-default'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-indigo-300'
                              }`}
                            >
                              {r === 'murid' ? 'Siswa' : r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/50">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <X size={12} />
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(user.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save size={12} />
                        Simpan
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(user)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit Profil</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400">
            Belum ada anggota terdaftar.
          </div>
        )}
      </div>
    </div>
  );
}
