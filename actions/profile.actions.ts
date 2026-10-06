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
import type { ActionResult, User } from '@/lib/types';
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
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
    },
  });
}
