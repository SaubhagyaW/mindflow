import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/conversations",
    "/dashboard/notes",
    "/dashboard/settings",
    "/dashboard/profile",
    "/dashboard/billing",
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to sign-in if accessing a protected route without being authenticated
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to terms page if user is authenticated but hasn't accepted terms
  // Only for dashboard routes, not services
  if (isProtectedRoute && token && token.hasAcceptedTerms === false) {
    // Don't redirect if already on the terms page
    if (!request.nextUrl.pathname.startsWith("/terms")) {
      // Store the intended destination to redirect back after accepting terms
      const termsUrl = new URL("/terms", request.url)
      termsUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(termsUrl)
    }
  }

  // Redirect to dashboard if accessing auth pages while already authenticated
  const authRoutes = ["/sign-in", "/sign-up"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/terms"],
}

