import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET() {
  try {
    // You can add database connection checks here if needed
    // const dbCheck = await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({ status: "error", message: "Health check failed" }, { status: 500 })
  }
}
