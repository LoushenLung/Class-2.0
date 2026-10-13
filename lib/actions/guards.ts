/**
 * lib/actions/guards.ts — Auth & role enforcement helpers
 *
 * Every Server Action calls these as its first two steps:
 *   1. `requireAuth()` — asserts a valid session exists
 *   2. `requireRole(user, allowed)` — asserts the user has the required role
 *
 * Req: 1.9, 13.1 | Design §8
 *
 * DEV BYPASS: Auth & role guard disabled.
 * requireAuth() always resolves with a guest admin user.
 * requireRole() always returns { ok: true }.
 * getCurrentUser() always returns the guest user.
 * Re-enable by reverting this file to the original implementation.
 */

import { cache } from "react";
import type { ActionResult, CurrentUser, UserRole } from "@/lib/types";

/** Synthetic guest user returned while auth bypass is active. */
const GUEST_USER: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "guest@dev.local",
  name: "Guest (Dev)",
  role: "admin",
  avatarUrl: null,
};

/**
 * DEV BYPASS: always returns the synthetic guest user.
 */
export const getCurrentUser = cache(
  async (): Promise<CurrentUser | null> => {
    return GUEST_USER;
  }
);

/**
 * DEV BYPASS: always resolves with the guest user.
 */
export async function requireAuth(): Promise<
  | { ok: true; user: CurrentUser }
  | { ok: false; result: ActionResult<never> }
> {
  return { ok: true, user: GUEST_USER };
}

/**
 * DEV BYPASS: always returns { ok: true } regardless of role.
 */
export function requireRole(
  _user: CurrentUser,
  _allowed: UserRole[]
): { ok: true } | { ok: false; result: ActionResult<never> } {
  return { ok: true };
}

