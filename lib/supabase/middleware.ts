/**
 * lib/supabase/middleware.ts — Session refresh middleware helper
 *
 * Called from root middleware.ts. Refreshes the session cookie on
 * every request so the access token doesn't silently expire.
 * Redirects unauthenticated users to /login, excluding public routes.
 *
 * Public routes: /login, /auth/**, /api/ping
 *
 * Req: 1.4, 1.5 | Design §5
 *
 * DEV BYPASS: Auth & role guard disabled — all routes are publicly accessible.
 * Re-enable by removing the early return below.
 */

import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // DEV BYPASS: skip all auth checks, allow guest access everywhere.
  return NextResponse.next({ request });
}
