'use server';

/**
 * actions/attendance.actions.ts — Server Actions for Presensi domain
 *
 * Req: 9.1, 9.2, 9.3 | Design §7
 *
 * SECURITY INVARIANT:
 * - A student (murid) can only record attendance for themselves:
 *   studentId must equal the authenticated user's id.
 * - getAttendanceStats returns only aggregate data (public, guest-safe).
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/actions/guards';
import { formatError } from '@/lib/utils';
import { recordAttendanceSchema } from '@/lib/validations/attendance';
import type { ActionResult, Attendance, AttendanceStats } from '@/lib/types';

// ---------------------------------------------------------------------------
// getAttendances
// ---------------------------------------------------------------------------

/**
 * Returns all attendance records for a given date.
 * Returns an empty array on any error.
 *
 * Req: 9.2
 *
 * @param dateStr - Date string in YYYY-MM-DD format.
 */
export async function getAttendances(dateStr: string): Promise<Attendance[]> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return [];

    return await prisma.attendance.findMany({
      where: { date: new Date(dateStr) },
      orderBy: { createdAt: 'asc' },
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// recordAttendance
// ---------------------------------------------------------------------------

/**
 * Creates or updates an attendance record for a student on a given date.
 *
 * - Any authenticated user may call this, but a student (murid) may only
 *   record their own attendance (studentId must equal user.id).
 * - Admin/bendahara may record attendance for any student.
 * - Uses upsert on the @@unique([studentId, date]) compound key.
 * - checkInTime is set to now() when status is "HADIR", otherwise null.
 *
 * Req: 9.1
 *
 * @param input - Unknown input validated against recordAttendanceSchema.
 */
export async function recordAttendance(
  input: unknown,
): Promise<ActionResult<Attendance>> {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.result;

    const { user } = authResult;

    const parsed = recordAttendanceSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Input tidak valid.',
      };
    }

    const { studentId, date, status } = parsed.data;

    // Students may only record their own attendance.
    if (user.role === 'murid' && studentId !== user.id) {
      return {
        success: false,
        error: 'Akses ditolak. Anda hanya dapat mencatat presensi diri sendiri.',
      };
    }

    const checkInTime = status === 'HADIR' ? new Date() : null;
    const dateObj = new Date(date);

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: dateObj,
        },
      },
      create: {
        studentId,
        date: dateObj,
        status,
        checkInTime,
      },
      update: {
        status,
        checkInTime,
      },
    });

    revalidatePath('/presensi');
    revalidatePath('/admin/presensi');

    return { success: true, data: attendance };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// ---------------------------------------------------------------------------
// getAttendanceStats
// ---------------------------------------------------------------------------

/**
 * Returns aggregated attendance statistics for a given date.
 * Public — no authentication required (guest-safe).
 * Only returns aggregate counts, not individual student data.
 *
 * Req: 9.3
 *
 * @param date - Date string in YYYY-MM-DD format.
 */
export async function getAttendanceStats(
  date: string,
): Promise<ActionResult<AttendanceStats>> {
  try {
    const [studentsCount, presentCount] = await Promise.all([
      prisma.user.count({ where: { role: 'murid' } }),
      prisma.attendance.count({
        where: { date: new Date(date), status: 'HADIR' },
      }),
    ]);

    const attendanceRate =
      studentsCount === 0
        ? 0
        : Math.round((presentCount / studentsCount) * 100 * 100) / 100;

    return {
      success: true,
      data: { studentsCount, presentCount, attendanceRate },
    };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
