'use server';

/**
 * actions/schedule.actions.ts — Server Actions for Jadwal Kelas domain
 *
 * Replaces the old mock-based implementation with Prisma + auth guards.
 * Tasks and Materials are handled in their own separate action files.
 *
 * Req: 8.1, 8.2 | Design §7
 */

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/actions/guards';
import { formatError } from '@/lib/utils';
import type { ActionResult, Schedule } from '@/lib/types';
import { upsertScheduleSlotSchema } from '@/lib/validations/schedule';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Returns all schedule slots ordered by day then period.
 * Public — no authentication required (guest-safe).
 */
export async function getScheduleSlots(): Promise<Schedule[]> {
  return prisma.schedule.findMany({
    orderBy: [{ dayOfWeek: 'asc' }, { periodOrder: 'asc' }],
  });
}

// ---------------------------------------------------------------------------
// Write — admin / bendahara only
// ---------------------------------------------------------------------------

/**
 * Creates or updates a schedule slot identified by (dayOfWeek, periodOrder).
 *
 * @param input - Raw (unvalidated) data from the form.
 */
export async function upsertScheduleSlot(
  input: unknown
): Promise<ActionResult<Schedule>> {
  // 1. Auth guard
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  // 2. Role guard
  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  // 3. Validation
  const parsed = upsertScheduleSlotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join(' '),
    };
  }

  const { dayOfWeek, periodOrder, periodLabel, subject, teacher, room, isBreak } =
    parsed.data;

  try {
    const slot = await prisma.schedule.upsert({
      where: {
        dayOfWeek_periodOrder: { dayOfWeek, periodOrder },
      },
      create: {
        dayOfWeek,
        periodOrder,
        periodLabel,
        subject: subject ?? null,
        teacher: teacher ?? null,
        room: room ?? null,
        isBreak,
      },
      update: {
        periodLabel,
        subject: subject ?? null,
        teacher: teacher ?? null,
        room: room ?? null,
        isBreak,
      },
    });

    revalidatePath('/jadwal');
    revalidatePath('/admin/jadwal');

    return { success: true, data: slot };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

/**
 * Deletes a schedule slot by its primary key ID.
 *
 * @param slotId - The CUID of the schedule row to delete.
 */
export async function deleteScheduleSlot(
  slotId: string
): Promise<ActionResult<Schedule>> {
  // 1. Auth guard
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.result;

  // 2. Role guard
  const roleResult = requireRole(authResult.user, ['admin', 'bendahara']);
  if (!roleResult.ok) return roleResult.result;

  try {
    const deleted = await prisma.schedule.delete({
      where: { id: slotId },
    });

    revalidatePath('/jadwal');
    revalidatePath('/admin/jadwal');

    return { success: true, data: deleted };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
