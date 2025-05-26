import { type NextRequest, NextResponse } from "next/server"
import { generatePaymentHash } from "@/lib/payhere"

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, currency = "USD" } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

    if (!merchantId || !merchantSecret) {
      console.error("PayHere configuration missing")
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })
    }

    // Generate hash
    const hash = generatePaymentHash(merchantId, orderId, amount.toString(), currency, merchantSecret)

    console.log("Generated hash for order:", orderId, "amount:", amount, "hash:", hash)

    return NextResponse.json({ hash })
  } catch (error) {
    console.error("Error generating hash:", error)
    return NextResponse.json({ error: "Failed to generate hash" }, { status: 500 })
  }
}
