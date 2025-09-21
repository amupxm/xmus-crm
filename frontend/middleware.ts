import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Check if user is accessing login page
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // If user has tokens and is trying to access login page, redirect to dashboard
  if ((accessToken || refreshToken) && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If no tokens exist, redirect to login
  if (!accessToken && !refreshToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * Note: login is included to handle authenticated user redirects
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};