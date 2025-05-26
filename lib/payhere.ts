import crypto from "crypto"

/**
 * Generate a hash for PayHere payment
 * @param merchantId - PayHere merchant ID
 * @param orderId - Order ID
 * @param amount - Payment amount (formatted with 2 decimal places)
 * @param currency - Currency code (LKR, USD, etc.)
 * @param merchantSecret - PayHere merchant secret
 * @returns The generated hash
 */
export function generatePaymentHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string,
): string {
  // Ensure amount has exactly 2 decimal places
  const formattedAmount = Number.parseFloat(amount).toFixed(2)

  // Generate merchant secret hash
  const merchantSecretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase()

  // Generate data string
  const dataString = `${merchantId}${orderId}${formattedAmount}${currency}${merchantSecretHash}`

  // Generate final hash
  const hash = crypto.createHash("md5").update(dataString).digest("hex").toUpperCase()

  return hash
}

/**
 * Verify PayHere payment hash
 * @param merchantId - PayHere merchant ID
 * @param orderId - Order ID
 * @param amount - Payment amount
 * @param currency - Currency code
 * @param statusCode - Payment status code
 * @param md5sig - MD5 signature from PayHere
 * @param merchantSecret - PayHere merchant secret
 * @returns Whether the hash is valid
 */
export function verifyPaymentHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  statusCode: string,
  md5sig: string,
  merchantSecret: string,
): boolean {
  try {
    // Ensure amount has exactly 2 decimal places
    const formattedAmount = Number.parseFloat(amount).toFixed(2)

    // Generate merchant secret hash
    const merchantSecretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase()

    // Generate data string
    const dataString = `${merchantId}${orderId}${formattedAmount}${currency}${statusCode}${merchantSecretHash}`

    // Generate verification hash
    const verificationHash = crypto.createHash("md5").update(dataString).digest("hex").toUpperCase()

    // Log verification details (for debugging)
    console.log("Hash verification:", {
      received: md5sig,
      calculated: verificationHash,
      match: verificationHash === md5sig,
    })

    return verificationHash === md5sig
  } catch (error) {
    console.error("Error verifying payment hash:", error)
    return false
  }
}
