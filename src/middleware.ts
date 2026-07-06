import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // If user is logged in
  if (token) {
    // If they are on root or login page, redirect to dashboard
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // If they are on onboarding page but already have a tenant, redirect to dashboard
    if (pathname === "/onboarding" && token.role !== "super-admin" && token.tenantId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // If user is not logged in and tries to access dashboard or onboarding
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/onboarding", "/dashboard/:path*"],
};
