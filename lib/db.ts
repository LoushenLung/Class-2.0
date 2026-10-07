/**
 * lib/db.ts — Prisma singleton
 *
 * Uses the `globalThis.__prisma` pattern to prevent multiple PrismaClient
 * instances from being created during hot-reload in development, and to allow
 * Vercel Lambda containers to reuse the same instance across warm invocations
 * (preventing connection pool exhaustion).
 *
 * Req: 17.5 | Design §12
 */

// Side-effect import: validates required env vars at module load time.
import "@/lib/env";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Extend globalThis so TypeScript knows about our singleton slot.
declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "";
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

// In non-production environments, pin the instance on globalThis so that
// Next.js hot-reload does not create a new PrismaClient on every module
// evaluation, which would exhaust the connection pool.
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
