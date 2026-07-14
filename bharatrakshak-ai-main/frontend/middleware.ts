import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/role-select",
  "/sos",
];

const PROTECTED_PREFIXES = [
  "/portal",
  "/dashboard",
  "/predict",
  "/damage-report",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`))
  );
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get("firebase-auth-session");

  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/dashboard/:path*",
    "/predict/:path*",
    "/damage-report/:path*",
  ],
};
