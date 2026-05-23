import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hr-management-super-secret-key-2024"
);

const protectedRoutes = ["/hr", "/employee"];
const publicRoutes = ["/", "/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes (except protected ones)
  if (publicRoutes.some((route) => pathname === route) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verify token
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Role-based access control
    if (pathname.startsWith("/hr") && role !== "hr") {
      return NextResponse.redirect(new URL("/employee", request.url));
    }

    if (pathname.startsWith("/employee") && role !== "employee") {
      return NextResponse.redirect(new URL("/hr", request.url));
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.id));
    requestHeaders.set("x-user-role", role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    // Invalid token - redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
