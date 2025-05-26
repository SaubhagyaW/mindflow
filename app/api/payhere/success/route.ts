import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get order ID from query params
    const searchParams = req.nextUrl.searchParams
    const orderId = searchParams.get("order_id") || searchParams.get("orderId")

    console.log("Payment success callback received for order:", orderId)

    // Redirect to dashboard with success message
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard?payment=success&order=${orderId}`)
  } catch (error) {
    console.error("Error handling payment success:", error)
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard?payment=error`)
  }
}
