import nodemailer from "nodemailer"

// Test email configuration
export async function testEmailConfig() {
  try {
    console.log("Testing email configuration...")

    // Check environment variables
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM']
    const missing = requiredVars.filter(varName => !process.env[varName])

    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }

    console.log("Email config:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER?.substring(0, 5) + "...",
      from: process.env.EMAIL_FROM
    })

    // Test transporter
    const transporter = getEmailTransporter()
    await transporter.verify()

    console.log("✅ Email configuration is valid")
    return { success: true, message: "Email configuration is valid" }

  } catch (error) {
    console.error("❌ Email configuration test failed:", error)
    throw error
  }
}

export function getEmailTransporter() {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
      // Add timeout settings
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
    })

    return transporter
  } catch (error) {
    console.error("Failed to create email transporter:", error)
    throw new Error(`Email transporter error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log("=== SENDING VERIFICATION EMAIL ===")
    console.log("To:", email)
    console.log("Token:", token.substring(0, 8) + "...")

    // Test configuration first
    await testEmailConfig()

    const transporter = getEmailTransporter()

    // Verify connection
    console.log("Verifying SMTP connection...")
    await transporter.verify()
    console.log("✅ SMTP connection verified")

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    console.log("Verification URL:", verificationUrl)

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your MindFlow account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">MindFlow</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #6b7280; margin-bottom: 30px; line-height: 1.6;">
              Thank you for signing up for MindFlow! Please click the button below to verify your email address and complete your registration.
            </p>
            
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #3B82F6; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 20px;">
              Verify Email Address
            </a>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all; font-family: monospace;">${verificationUrl}</span>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create a MindFlow account, you can safely ignore this email.</p>
          </div>
        </div>
      `,
      text: `
Verify Your MindFlow Account

Thank you for signing up for MindFlow! Please visit the following link to verify your email address:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create a MindFlow account, you can safely ignore this email.
      `
    }

    console.log("Sending email...")
    const result = await transporter.sendMail(mailOptions)
    console.log("✅ Email sent successfully!")
    console.log("Message ID:", result.messageId)
    console.log("Response:", result.response)

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    }

  } catch (error) {
    console.error("❌ Failed to send verification email:")
    console.error("Error type:", error.constructor.name)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Re-throw with more context
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
