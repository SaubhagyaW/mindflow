/**
 * Generates a strong password with the following characteristics:
 * - At least 12 characters long
 * - Contains lowercase letters
 * - Contains uppercase letters
 * - Contains numbers
 * - Contains special characters
 */
export function generateStrongPassword(length = 16): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-="
  
    const allChars = lowercase + uppercase + numbers + special
  
    // Ensure at least one character from each category
    let password =
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      special.charAt(Math.floor(Math.random() * special.length))
  
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
  
    // Shuffle the password characters
    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("")
  }
  
  /**
   * Checks the strength of a password and returns a score from 0-4
   * 0 = Very Weak, 1 = Weak, 2 = Medium, 3 = Strong, 4 = Very Strong
   */
  export function checkPasswordStrength(password: string): number {
    let score = 0
  
    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
  
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
  
    // Normalize score to 0-4 range
    return Math.min(4, Math.floor(score / 1.5))
  }
  
  