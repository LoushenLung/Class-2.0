// Feature: backend-class-rpl-1, Property 2: Unique payment constraint
/**
 * Property 2: Unique Payment Constraint — No Duplicate Payments
 *
 * For any student and dues period, attempting to create two DuesPayment records
 * with the same (studentId, duePeriodId) pair SHALL fail with Prisma P2002.
 *
 * Validates: Req 3.3, 5.1
 * Design §14, Property 2
 */

import * as fc from "fast-check";
import { describe, test, beforeAll, afterAll } from "vitest";
import { Prisma } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Database availability check
// ---------------------------------------------------------------------------

async function isDatabaseAvailable(): Promise<boolean> {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 2: Unique payment constraint — no duplicate payments", () => {
  let dbAvailable = false;

  beforeAll(async () => {
    dbAvailable = await isDatabaseAvailable();
  });

  afterAll(async () => {
    if (dbAvailable) {
      // Disconnect prisma after all tests
      const { prisma } = await import("@/lib/db");
      await prisma.$disconnect();
    }
  });

  test(
    "duplicate (studentId, duePeriodId) pair is always rejected with P2002",
    async () => {
      if (!dbAvailable) {
        console.warn(
          "[SKIP] Database unavailable — skipping Property 2 test. " +
            "Ensure DATABASE_URL is set and Supabase project is active."
        );
        return;
      }

      const { prisma } = await import("@/lib/db");

      await fc.assert(
        fc.asyncProperty(
          // Arbitrary 1: a suffix for unique user/period names per run
          fc.nat({ max: 999_999 }),
          async (runSuffix) => {
            // ---------------------------------------------------------------
            // Fixture IDs — unique per run to avoid cross-run interference
            // ---------------------------------------------------------------
            const testRunId = `prop2-${runSuffix}-${Date.now()}`;
            const userId = crypto.randomUUID();
            const periodName = `Test Period ${testRunId}`;

            let duePeriodId: string | null = null;

            try {
              // ---------------------------------------------------------------
              // 1. Create fixture User (mirrors auth.users id pattern)
              // ---------------------------------------------------------------
              await prisma.user.create({
                data: {
                  id: userId,
                  email: `test-${testRunId}@prop2.test`,
                  name: `Test User ${testRunId}`,
                  role: "murid",
                },
              });

              // ---------------------------------------------------------------
              // 2. Create fixture DuesPeriod
              // ---------------------------------------------------------------
              const period = await prisma.duesPeriod.create({
                data: {
                  name: periodName,
                  amount: 50_000,
                  startDate: new Date("2024-01-01"),
                  endDate: new Date("2024-06-30"),
                },
              });
              duePeriodId = period.id;

              // ---------------------------------------------------------------
              // 3. First create — must succeed
              // ---------------------------------------------------------------
              await prisma.duesPayment.create({
                data: {
                  studentId: userId,
                  duePeriodId: period.id,
                  status: "pending",
                },
              });

              // ---------------------------------------------------------------
              // 4. Second create with identical (studentId, duePeriodId) pair
              //    MUST throw P2002
              // ---------------------------------------------------------------
              let threw = false;
              try {
                await prisma.duesPayment.create({
                  data: {
                    studentId: userId,
                    duePeriodId: period.id,
                    status: "pending",
                  },
                });
              } catch (err) {
                if (
                  err instanceof Prisma.PrismaClientKnownRequestError &&
                  err.code === "P2002"
                ) {
                  threw = true;
                } else {
                  // Unexpected error — rethrow
                  throw err;
                }
              }

              return threw;
            } finally {
              // ---------------------------------------------------------------
              // Cleanup — delete in dependency order (payments → period → user)
              // ---------------------------------------------------------------
              try {
                await prisma.duesPayment.deleteMany({
                  where: { studentId: userId },
                });
                if (duePeriodId !== null) {
                  await prisma.duesPeriod.delete({
                    where: { id: duePeriodId },
                  });
                }
                await prisma.user.delete({ where: { id: userId } });
              } catch {
                // Best-effort cleanup — do not fail the test on cleanup errors
              }
            }
          }
        ),
        {
          numRuns: 50,
          verbose: true,
        }
      );
    },
    // Generous timeout — each run hits the DB twice (create + duplicate attempt)
    // plus cleanup: 50 runs × ~1s per round-trip ≈ up to 60s
    { timeout: 120_000 }
  );
});
