import crypto from "crypto"

const algorithm = "aes-256-cbc"
const ivLength = 16 // AES block size in bytes
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex") // Must be 32 bytes for aes-256-cbc

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, "utf8", "base64")
  encrypted += cipher.final("base64")
  return `${iv.toString("base64")}:${encrypted}`
}

export function decrypt(encrypted: string): string {
  try {
    const [ivBase64, encryptedText] = encrypted.split(":")
    
    if (!ivBase64 || !encryptedText) {
      throw new Error("Invalid encrypted format. Expected 'iv:encrypted'.")
    }

    const iv = Buffer.from(ivBase64, "base64")
    if (iv.length !== ivLength) {
      throw new Error(`Invalid IV length. Expected ${ivLength} bytes, got ${iv.length}.`)
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedText, "base64", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted

  } catch (error) {
    console.error("Decryption failed:", error)
    // Optionally rethrow or return a fallback
    throw new Error("Failed to decrypt data.")
  }
}
