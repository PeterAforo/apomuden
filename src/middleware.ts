import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Roles that can access admin routes
const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "MINISTRY_ADMIN",
  "REGIONAL_DIRECTOR",
  "DISTRICT_OFFICER",
  "ANALYST",
];

// Roles that can access facility admin routes
const FACILITY_ADMIN_ROLES = [
  "FACILITY_ADMIN",
  "FACILITY_STAFF",
  "FACILITY_VIEWER",
  ...ADMIN_ROLES,
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Not logged in - redirect to login
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      // Redirect to unauthorized page or home
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Protect /facility-admin routes
  if (pathname.startsWith("/facility-admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !FACILITY_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Protect /dashboard routes (requires any authenticated user)
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/facility-admin/:path*",
    "/dashboard/:path*",
  ],
};
