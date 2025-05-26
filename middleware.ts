import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/sign-in" ||
    path === "/sign-up" ||
    path === "/api/auth" ||
    path === "/terms" ||
    path === "/privacy" ||
    path === "/about" ||
    path === "/contact" ||
    path === "/services" ||
    path === "/return-policy" ||
    path === "/check-email" ||
    path === "/verify-email" ||
    path === "/api/health" ||
    path.startsWith("/api/auth/") ||
    path.startsWith("/pricing") || // Allow pricing page without login
    path.startsWith("/api/payments/payhere/") // Allow PayHere endpoints without login

  // Define protected paths that require authentication
  const isProtectedPath = path === "/dashboard" || path.startsWith("/dashboard/") || path === "/accept-terms"

  const token = await getToken({ req })

  // Redirect to sign-in if trying to access a protected route without being authenticated
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  // Redirect to dashboard if already authenticated and trying to access auth pages
  if ((path === "/sign-in" || path === "/sign-up") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect to accept-terms if authenticated but terms not accepted
  if (token && !token.hasAcceptedTerms && path !== "/accept-terms" && isProtectedPath) {
    return NextResponse.redirect(new URL("/accept-terms", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
}
