'use server';

/**
 * actions/announcement.actions.ts — Server Actions for Pengumuman domain
 *
 * Req: 7.1, 7.2, 7.3, 7.4, 7.5 | Design §7
 *
 * SECURITY INVARIANT:
 * - authorId is NEVER read from user input — always taken from the session.
 * - Only admin/bendahara OR the original author may publish/update/delete.
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/actions/guards';
import { formatError } from '@/lib/utils';
import { createAnnouncementSchema, updateAnnouncementSchema } from '@/lib/validations/announcement';
import type { ActionResult, Announcement } from '@/lib/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REVALIDATE_PATHS = ['/pengumuman', '/admin/pengumuman'] as const;

function revalidateAnnouncementPaths(): void {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

/**
 * Checks whether the current user is allowed to mutate an announcement.
 * Allowed when: user has admin/bendahara role OR is the original author.
 */
function canMutate(userRole: string, userId: string, authorId: string): boolean {
  return userRole === 'admin' || userRole === 'bendahara' || userId === authorId;
}

// ---------------------------------------------------------------------------
// getAnnouncements
// ---------------------------------------------------------------------------

/**
 * Returns published announcements for regular users and guests,
 * or all announcements for admin/bendahara.
 * Public — no authentication required (guest-safe).
 *
 * Req: 7.1
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const authResult = await requireAuth();
    const user = authResult.ok ? authResult.user : null;
    const isPrivileged =
      user !== null &&
      (user.role === 'admin' || user.role === 'bendahara');

    return await prisma.announcement.findMany({
      where: isPrivileged ? undefined : { status: 'published' },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// createAnnouncement
// ---------------------------------------------------------------------------

/**
 * Creates a new announcement with status "draft".
 * authorId is sourced from the session — never from input.
 *
 * Req: 7.2
 */
export async function createAnnouncement(
  input: unknown,
): Promise<ActionResult<Announcement>> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.result;

    const { user } = authResult;

    const roleResult = requireRole(user, ['admin', 'bendahara']);
    if (!roleResult.ok) return roleResult.result;

    const parsed = createAnnouncementSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
      };
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        status: 'draft',
        authorId: user.id,
      },
    });

    revalidateAnnouncementPaths();
    return { success: true, data: announcement };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// ---------------------------------------------------------------------------
// publishAnnouncement
// ---------------------------------------------------------------------------

/**
 * Sets an announcement status to "published" and records publishedAt.
 * Allowed for admin/bendahara or the original author.
 *
 * Req: 7.3
 */
export async function publishAnnouncement(
  announcementId: string,
): Promise<ActionResult<Announcement>> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.result;

    const { user } = authResult;

    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing) {
      return { success: false, error: 'Pengumuman tidak ditemukan.' };
    }

    if (!canMutate(user.role, user.id, existing.authorId)) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    revalidateAnnouncementPaths();
    return { success: true, data: announcement };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// ---------------------------------------------------------------------------
// updateAnnouncement
// ---------------------------------------------------------------------------

/**
 * Updates title and/or content of an existing announcement.
 * Allowed for admin/bendahara or the original author.
 *
 * Req: 7.4
 */
export async function updateAnnouncement(
  input: unknown,
): Promise<ActionResult<Announcement>> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.result;

    const { user } = authResult;

    const parsed = updateAnnouncementSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
      };
    }

    const { id, ...updateData } = parsed.data;

    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Pengumuman tidak ditemukan.' };
    }

    if (!canMutate(user.role, user.id, existing.authorId)) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    revalidateAnnouncementPaths();
    return { success: true, data: announcement };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// ---------------------------------------------------------------------------
// deleteAnnouncement
// ---------------------------------------------------------------------------

/**
 * Permanently deletes an announcement.
 * Allowed for admin/bendahara or the original author.
 *
 * Req: 7.5
 */
export async function deleteAnnouncement(
  announcementId: string,
): Promise<ActionResult<Announcement>> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.result;

    const { user } = authResult;

    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing) {
      return { success: false, error: 'Pengumuman tidak ditemukan.' };
    }

    if (!canMutate(user.role, user.id, existing.authorId)) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const announcement = await prisma.announcement.delete({
      where: { id: announcementId },
    });

    revalidateAnnouncementPaths();
    return { success: true, data: announcement };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
