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
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSafePostAuthPath } from "@/lib/auth/redirect";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isPublicRoute =
    isAuthRoute ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/ping" ||
    pathname === "/" ||
    pathname === "/galeri";

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublicKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabasePublicKey) {
      console.warn("Supabase environment variables missing in middleware.");
      if (!isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabasePublicKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Do not add logic between createServerClient and getClaims: this call is
    // responsible for both token refresh and trusted JWT verification.
    const {
      data,
      error,
    } = await supabase.auth.getClaims();
    const isAuthenticated = !error && Boolean(data?.claims?.sub);

    if (!isAuthenticated && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }

    if (isAuthenticated && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = getSafePostAuthPath(request.nextUrl.searchParams.get("next"));
      url.search = "";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("Middleware updateSession failed.");
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
