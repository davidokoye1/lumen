import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/learn", "/train", "/library", "/analytics", "/achievements", "/settings", "/onboarding", "/check-in"];

/**
 * Optimistic gate: bounce visitors without a session cookie before rendering.
 * The real check (token lookup + expiry) happens server-side in requireUser().
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (needsAuth && !request.cookies.has("lumen_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|woff2?)$).*)"],
};
