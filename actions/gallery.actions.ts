'use server';

/**
 * actions/gallery.actions.ts — Server Actions untuk Galeri Foto
 *
 * Req: 6.1, 6.2 | Design §7
 *
 * NOTE: Forum actions telah dipindah ke actions/forum.actions.ts (task 5.7).
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/actions/guards';
import { formatError } from '@/lib/utils';
import type { ActionResult, PhotoGallery, Photo } from '@/lib/types';
import {
  createGallerySchema,
  uploadPhotoSchema,
} from '@/lib/validations/gallery';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  GALLERY_FOLDER,
} from '@/lib/cloudinary';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GALLERY_PATHS = ['/galeri', '/admin/galeri'] as const;

function revalidateGalleryPaths(): void {
  for (const path of GALLERY_PATHS) {
    revalidatePath(path);
  }
}

// ─── getGalleries ─────────────────────────────────────────────────────────────

/**
 * Returns all photo galleries including their photos.
 * Public — no authentication required (guest-safe).
 */
export async function getGalleries(): Promise<(PhotoGallery & { photos: Photo[] })[]> {
  return prisma.photoGallery.findMany({
    include: { photos: true },
    orderBy: { eventDate: 'desc' },
  });
}

// ─── createGallery ────────────────────────────────────────────────────────────

/**
 * Creates a new photo gallery (album).
 * Requires role: admin | bendahara.
 */
export async function createGallery(
  input: unknown
): Promise<ActionResult<PhotoGallery>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  const parsed = createGallerySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
    };
  }

  try {
    const gallery = await prisma.photoGallery.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        eventDate: new Date(parsed.data.eventDate),
      },
    });

    revalidateGalleryPaths();
    return { success: true, data: gallery };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

// ─── uploadPhoto ──────────────────────────────────────────────────────────────

/**
 * Uploads a photo to Cloudinary and creates a Photo record in the DB.
 * Requires role: admin | bendahara.
 *
 * If the DB insert fails AFTER the Cloudinary upload,
 * logs the error and returns failure (Cloudinary asset is left orphaned
 * but the operation is considered failed from the caller's perspective).
 */
export async function uploadPhoto(
  galleryId: string,
  fileBuffer: Buffer,
  mimeType: string,
  fileSizeBytes: number,
  caption?: string
): Promise<ActionResult<Photo>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  const parsed = uploadPhotoSchema.safeParse({
    galleryId,
    mimeType,
    fileSizeBytes,
    caption,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
    };
  }

  // Verify the gallery exists
  const gallery = await prisma.photoGallery.findUnique({
    where: { id: parsed.data.galleryId },
    select: { id: true },
  });
  if (!gallery) {
    return { success: false, error: 'Album tidak ditemukan.' };
  }

  // Upload to Cloudinary
  let cloudinaryUrl: string;
  let cloudinaryId: string;
  try {
    const result = await uploadToCloudinary(fileBuffer, GALLERY_FOLDER);
    cloudinaryUrl = result.url;
    cloudinaryId = result.publicId;
  } catch (err) {
    return { success: false, error: formatError(err) };
  }

  // Insert Photo record — if this fails, log and return failure
  try {
    const photo = await prisma.photo.create({
      data: {
        galleryId: parsed.data.galleryId,
        cloudinaryUrl,
        cloudinaryId,
        caption: parsed.data.caption,
      },
    });

    revalidateGalleryPaths();
    return { success: true, data: photo };
  } catch (err) {
    // DB insert failed after upload — log and return failure
    console.error(
      '[uploadPhoto] DB insert gagal setelah upload Cloudinary.',
      { cloudinaryId },
      err
    );
    return { success: false, error: formatError(err) };
  }
}

// ─── deletePhoto ──────────────────────────────────────────────────────────────

/**
 * Deletes a photo from Cloudinary and removes its DB record.
 * Requires role: admin | bendahara.
 */
export async function deletePhoto(
  photoId: string
): Promise<ActionResult<Photo>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });
    if (!photo) {
      return { success: false, error: 'Foto tidak ditemukan.' };
    }

    await deleteFromCloudinary(photo.cloudinaryId);

    const deleted = await prisma.photo.delete({ where: { id: photoId } });

    revalidateGalleryPaths();
    return { success: true, data: deleted };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}

// ─── deleteGallery ────────────────────────────────────────────────────────────

/**
 * Deletes a gallery (album) and all its photos via DB cascade.
 * Requires role: admin | bendahara.
 *
 * NOTE: Cascaded Photo rows are removed by the DB constraint.
 * Cloudinary assets are NOT individually deleted here; use deletePhoto
 * per-photo before calling this action if you need Cloudinary cleanup.
 */
export async function deleteGallery(
  galleryId: string
): Promise<ActionResult<PhotoGallery>> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  try {
    // Find all associated photos to clean up Cloudinary assets before DB deletion
    const photos = await prisma.photo.findMany({
      where: { galleryId },
      select: { cloudinaryId: true },
    });

    if (photos.length > 0) {
      await Promise.allSettled(
        photos.map((photo: { cloudinaryId: string }) => deleteFromCloudinary(photo.cloudinaryId))
      );
    }

    const deleted = await prisma.photoGallery.delete({
      where: { id: galleryId },
    });

    revalidateGalleryPaths();
    return { success: true, data: deleted };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}
