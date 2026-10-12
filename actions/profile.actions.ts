'use server';

/**
 * actions/profile.actions.ts — Server Actions untuk Profil Pengguna
 *
 * Req: 12.1 | Design §7
 *
 * NOTE: File ini menggantikan implementasi lama yang menggunakan mock
 * getDb/saveDb. Semua operasi kini menggunakan Prisma + Supabase Auth.
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/actions/guards';
import { formatError } from '@/lib/utils';
import type { ActionResult, User, UserRole } from '@/lib/types';
import { updateProfileSchema } from '@/lib/validations/profile';
import { uploadToCloudinary, AVATAR_FOLDER } from '@/lib/cloudinary';

// ─── updateProfile ────────────────────────────────────────────────────────────

/**
 * Updates the authenticated user's profile (name and optional avatar).
 *
 * SECURITY: The `role` field is NEVER written, even if present in input.
 * Avatar is uploaded to Cloudinary when a buffer is provided.
 *
 * Requires authentication (any role).
 */
export async function updateProfile(
  input: unknown,
  avatarBuffer?: Buffer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _avatarMimeType?: string
): Promise<ActionResult<User>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;
  const { user } = authResult;

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
    };
  }

  // Resolve avatarUrl: upload to Cloudinary if buffer provided, else keep existing
  let avatarUrl: string | undefined = parsed.data.avatarUrl;
  if (avatarBuffer) {
    try {
      const result = await uploadToCloudinary(avatarBuffer, AVATAR_FOLDER);
      avatarUrl = result.url;
    } catch (err) {
      return { success: false, error: formatError(err) };
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        // avatarUrl is only set when a new value is resolved
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    revalidatePath('/profil');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

// ─── getProfile ───────────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's own profile row from public.users.
 * Returns null if not found (should not happen in normal flow).
 *
 * Requires authentication (any role).
 */
export async function getProfile(): Promise<User | null> {
  const authResult = await requireAuth();
  if (!authResult.ok) return null;
  const { user } = authResult;

  return prisma.user.findUnique({
    where: { id: user.id },
  });
}

// ─── getProfiles ──────────────────────────────────────────────────────────────

/**
 * Returns all user profiles from public.users.
 * For admin user management only.
 *
 * Requires authentication + role: admin.
 */
export async function getProfiles(): Promise<User[]> {
  const authResult = await requireAuth();
  if (!authResult.ok) return [];

  const roleResult = requireRole(authResult.user, ['admin']);
  if (!roleResult.ok) return [];

  return prisma.user.findMany();
}

// ─── getPublicProfiles ────────────────────────────────────────────────────────

/** Minimal public profile shape — no email or sensitive data. */
export interface PublicProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

/**
 * Returns all user profiles with minimal public fields.
 * Public — no authentication required (guest-safe).
 * Used by the homepage members widget and layout sidebar.
 */
export async function getPublicProfiles(): Promise<PublicProfile[]> {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    });
  } catch (error) {
    console.error('[getPublicProfiles] Error fetching public profiles:', error);
    return [];
  }
}

// ─── updateUserRole ──────────────────────────────────────────────────────────

/**
 * Updates a user's role.
 *
 * SECURITY: Restricted exclusively to administrators.
 * Prevents removing the last admin's role to prevent lock-out.
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<ActionResult<User>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleCheck = requireRole(authResult.user, ['admin']);
  if (!roleCheck.ok) return roleCheck.result;

  const validRoles: UserRole[] = ['admin', 'bendahara', 'murid'];
  if (!validRoles.includes(newRole)) {
    return { success: false, error: 'Role yang dipilih tidak valid.' };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    // Safeguard: Prevent admin from demoting themselves if they are the sole admin
    if (authResult.user.id === userId && newRole !== 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        return {
          success: false,
          error: 'Tidak dapat mengubah role karena Anda adalah satu-satunya admin aktif.',
        };
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath('/admin/users');
    revalidatePath('/profil');
    revalidatePath('/', 'layout');

    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

// ─── adminUpdateUserProfile ──────────────────────────────────────────────────

/**
 * Updates a user's name and/or role as an administrator.
 *
 * SECURITY: Restricted exclusively to administrators.
 */
export async function adminUpdateUserProfile(
  userId: string,
  data: { name?: string; role?: UserRole }
): Promise<ActionResult<User>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleCheck = requireRole(authResult.user, ['admin']);
  if (!roleCheck.ok) return roleCheck.result;

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    const trimmedName = data.name?.trim();
    if (trimmedName !== undefined) {
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        return {
          success: false,
          error: 'Nama harus memiliki panjang antara 2 hingga 100 karakter.',
        };
      }
    }

    if (data.role !== undefined) {
      const validRoles: UserRole[] = ['admin', 'bendahara', 'murid'];
      if (!validRoles.includes(data.role)) {
        return { success: false, error: 'Role yang dipilih tidak valid.' };
      }

      if (authResult.user.id === userId && data.role !== 'admin') {
        const adminCount = await prisma.user.count({
          where: { role: 'admin' },
        });
        if (adminCount <= 1) {
          return {
            success: false,
            error: 'Tidak dapat mengubah role karena Anda adalah satu-satunya admin aktif.',
          };
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(trimmedName !== undefined && { name: trimmedName }),
        ...(data.role !== undefined && { role: data.role }),
      },
    });

    revalidatePath('/admin/users');
    revalidatePath('/profil');
    revalidatePath('/', 'layout');

    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

