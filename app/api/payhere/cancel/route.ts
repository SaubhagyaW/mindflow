import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get order ID from query params
    const searchParams = req.nextUrl.searchParams
    const orderId = searchParams.get("order_id") || searchParams.get("orderId")

    console.log("Payment cancelled for order:", orderId)

    // Redirect to pricing page with cancelled message
    return NextResponse.redirect(`${req.nextUrl.origin}/pricing?payment=cancelled&order=${orderId}`)
  } catch (error) {
    console.error("Error handling payment cancellation:", error)
    return NextResponse.redirect(`${req.nextUrl.origin}/pricing?payment=error`)
  }
}
