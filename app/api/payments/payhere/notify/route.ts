import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getPlanTimeLimit } from "@/lib/subscription"
import crypto from "crypto"

// PayHere notification handler
export async function POST(req: Request) {
  console.log("PayHere notification received")

  try {
    // Parse form data
    const formData = await req.formData()

    // Convert FormData to a regular object
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    console.log("PayHere notification data:", JSON.stringify(data, null, 2))

    // Extract payment details
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1, // User ID
      custom_2, // Plan info (e.g., "pro-10h:monthly")
      method, // Payment method
    } = data

    // Skip verification in development for easier testing
    const skipVerification = process.env.NODE_ENV === "development" && process.env.SKIP_PAYHERE_VERIFICATION === "true"

    if (!skipVerification) {
      // Verify the payment notification
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
      if (!merchantSecret) {
        console.error("PAYHERE_MERCHANT_SECRET is not set")
        return NextResponse.json({ error: "Configuration error" }, { status: 500 })
      }

      const localMd5sig = crypto
        .createHash("md5")
        .update(
          merchant_id +
            order_id +
            payhere_amount +
            payhere_currency +
            status_code +
            crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase(),
        )
        .digest("hex")
        .toUpperCase()

      console.log("Generated hash:", localMd5sig)
      console.log("Received hash:", md5sig)

      if (localMd5sig !== md5sig) {
        console.error("Hash verification failed")
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    // Check if payment is successful
    if (status_code !== "2") {
      console.log(`Payment not successful. Status code: ${status_code}`)
      return NextResponse.json({ message: "Payment not successful" })
    }

    // Extract user ID and plan details
    const userId = custom_1
    if (!userId) {
      console.error("User ID not provided in custom_1")
      return NextResponse.json({ error: "User ID not provided" }, { status: 400 })
    }

    // Parse plan info (format: "plan:cycle")
    const planInfo = custom_2 ? custom_2.split(":") : []
    const planTier = planInfo[0] || "pro-10h" // Default to pro-10h if not specified
    const billingCycle = planInfo[1] || "monthly" // Default to monthly if not specified

    console.log(`Processing payment for user ${userId}, plan: ${planTier}, cycle: ${billingCycle}`)

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      console.error(`User not found: ${userId}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate subscription dates
    const startDate = new Date()
    const endDate: Date | null = new Date()

    // Set end date based on billing cycle
    if (billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (billingCycle === "quarterly") {
      endDate.setMonth(endDate.getMonth() + 3)
    } else if (billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (billingCycle === "lifetime") {
      // Set to a far future date for "lifetime" subscriptions
      endDate.setFullYear(endDate.getFullYear() + 100)
    }

    // Calculate monthly time limit based on plan
    const monthlyTimeLimit = getPlanTimeLimit(planTier)

    console.log(
      `Setting subscription: plan=${planTier}, startDate=${startDate}, endDate=${endDate}, timeLimit=${monthlyTimeLimit}`,
    )

    // Update or create subscription using raw SQL to avoid TypeScript errors
    if (user.subscription) {
      // Update existing subscription using raw SQL
      await prisma.$executeRaw`
        UPDATE "Subscription"
        SET 
          "plan" = ${planTier},
          "startDate" = ${startDate},
          "endDate" = ${endDate},
          "monthlyTimeLimit" = ${monthlyTimeLimit},
          "usedTime" = 0,
          "updatedAt" = NOW()
        WHERE "id" = ${user.subscription.id}
      `
      console.log(`Updated subscription for user ${userId}`)
    } else {
      // Create new subscription using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "Subscription" (
          "id", "userId", "plan", "startDate", "endDate", 
          "monthlyTimeLimit", "usedTime", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), ${userId}, ${planTier}, ${startDate}, ${endDate},
          ${monthlyTimeLimit}, 0, NOW(), NOW()
        )
      `
      console.log(`Created new subscription for user ${userId}`)
    }

    // Try to record payment if Payment model exists
    try {
      // Use raw SQL to check if Payment table exists and create a record
      const result = await prisma.$queryRaw`
        INSERT INTO "Payment" (
          "id", "userId", "orderId", "amount", "currency", "status", 
          "paymentMethod", "planTier", "billingCycle", "createdAt", "updatedAt"
        ) 
        VALUES (
          gen_random_uuid(), ${userId}, ${order_id}, ${Number.parseFloat(payhere_amount)}, 
          ${payhere_currency}, 'completed', ${method || "unknown"}, 
          ${planTier}, ${billingCycle}, NOW(), NOW()
        )
        RETURNING "id"
      `
      console.log("Payment record created:", result)
    } catch (error) {
      // If this fails, it's likely because the Payment model doesn't exist
      // We'll just log it and continue
      console.log("Could not create payment record:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing PayHere notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
