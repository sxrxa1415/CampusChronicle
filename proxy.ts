import { NextRequest, NextResponse } from "next/server";

// Next.js 16 proxy — must export a named `proxy` function
// Replaces deprecated middleware.ts

const PUBLIC_PATHS = ["/", "/api/auth/login", "/api/auth/logout"];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow public pages and auth endpoints
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/avatars") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Protect dashboard and API routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    const token = request.cookies.get("cc-token")?.value;
    const userId = request.cookies.get("cc-user-id")?.value;

    if (!token || !userId) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { success: false, message: "Authentication required." },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
