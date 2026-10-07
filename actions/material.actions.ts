'use server';

/**
 * actions/material.actions.ts — Server Actions untuk Materi Pelajaran
 *
 * Req: 10.1 | Design §7
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/actions/guards';
import { formatError } from '@/lib/utils';
import type { ActionResult, Material } from '@/lib/types';
import {
  createMaterialSchema,
  ALLOWED_MATERIAL_MIME_TYPES,
  MAX_MATERIAL_FILE_SIZE_BYTES,
} from '@/lib/validations/material';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  MATERI_FOLDER,
} from '@/lib/cloudinary';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MATERIAL_PATHS = ['/materi', '/admin/materi'] as const;

function revalidateMaterialPaths(): void {
  for (const path of MATERIAL_PATHS) {
    revalidatePath(path);
  }
}

// ─── createMaterial ───────────────────────────────────────────────────────────

/**
 * Creates a new material record.
 *
 * - If `fileBuffer` is provided: validates MIME type + size, uploads to
 *   Cloudinary, and stores `fileUrl` + `cloudinaryId` in the DB.
 * - Otherwise: expects `externalLink` to be present in `input`.
 *
 * Requires role: admin | bendahara.
 */
export async function createMaterial(
  input: unknown,
  fileBuffer?: Buffer,
  fileMimeType?: string,
  fileSizeBytes?: number
): Promise<ActionResult<Material>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  // ── File upload path ────────────────────────────────────────────────────────
  let fileUrl: string | undefined;
  let cloudinaryId: string | undefined;

  if (fileBuffer) {
    // Validate MIME type
    if (
      !fileMimeType ||
      !(ALLOWED_MATERIAL_MIME_TYPES as readonly string[]).includes(fileMimeType)
    ) {
      return {
        success: false,
        error: 'Format file tidak didukung. Gunakan PDF, PPT/X, DOC/X, ZIP/RAR, TXT, JPEG, PNG, atau WebP.',
      };
    }

    // Validate file size
    if (!fileSizeBytes || fileSizeBytes > MAX_MATERIAL_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'Ukuran file maksimal 10 MB.',
      };
    }

    try {
      const result = await uploadToCloudinary(fileBuffer, MATERI_FOLDER);
      fileUrl = result.url;
      cloudinaryId = result.publicId;
    } catch (err) {
      return { success: false, error: formatError(err) };
    }
  }

  const baseInput =
    typeof input === 'object' && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const parsed = createMaterialSchema.safeParse(
    fileUrl
      ? { ...baseInput, fileUrl, cloudinaryId }
      : input
  );
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
    };
  }

  // ── Persist to DB ────────────────────────────────────────────────────────────
  try {
    const material = await prisma.material.create({
      data: {
        title: parsed.data.title,
        subjectName: parsed.data.subjectName,
        description: parsed.data.description,
        ...(parsed.data.fileUrl
          ? {
              fileUrl: parsed.data.fileUrl,
              cloudinaryId: parsed.data.cloudinaryId,
            }
          : {
              externalLink: parsed.data.externalLink,
            }),
      },
    });

    revalidateMaterialPaths();
    return { success: true, data: material };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

// ─── deleteMaterial ───────────────────────────────────────────────────────────

/**
 * Deletes a material record and its Cloudinary asset (if any).
 *
 * - If `cloudinaryId` is set: removes the asset from Cloudinary first,
 *   then deletes the DB record.
 * - If `cloudinaryId` is null: deletes the DB record directly.
 *
 * Requires role: admin | bendahara.
 */
export async function deleteMaterial(
  materialId: string
): Promise<ActionResult<Material>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  try {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) {
      return { success: false, error: 'Materi tidak ditemukan.' };
    }

    if (material.cloudinaryId) {
      await deleteFromCloudinary(material.cloudinaryId);
    }

    const deleted = await prisma.material.delete({
      where: { id: materialId },
    });

    revalidateMaterialPaths();
    return { success: true, data: deleted };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

// ─── getMaterials ─────────────────────────────────────────────────────────────

/**
 * Returns all materials ordered by newest first.
 * Requires authentication (any role).
 */
export async function getMaterials(): Promise<Material[]> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return [];

    return await prisma.material.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('[getMaterials] Error fetching materials:', error);
    return [];
  }
}
