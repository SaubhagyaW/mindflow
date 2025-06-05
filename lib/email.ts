import nodemailer from "nodemailer"

// Email configuration validation
const validateEmailConfig = () => {
  const required = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(', ')}`)
  }
}

export function getEmailTransporter() {
  try {
    validateEmailConfig()

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
      // Add debugging
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
  })

    return transporter
  } catch (error) {
    console.error("Email transporter configuration error:", error)
    throw error
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log("Attempting to send verification email to:", email)

  const transporter = getEmailTransporter()

    // Test transporter connection
    try {
      await transporter.verify()
      console.log("Email transporter connection verified")
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError)
      throw new Error("Email service unavailable")
    }

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
              <span style="word-break: break-all;">${verificationUrl}</span>
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

    const result = await transporter.sendMail(mailOptions)
    console.log("Verification email sent successfully:", result.messageId)

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw error
  }
}

export async function sendNoteShareEmail(recipient: string, content: string, title: string) {
  try {
  const transporter = getEmailTransporter()

  const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: `Shared Note: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E40AF; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MindFlow</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; background-color: #ffffff;">
            <h2 style="color: #1E40AF; margin-top: 0;">Shared Note: ${title}</h2>
            <div style="background-color: #f5f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #1E40AF;">
              <pre style="color: #333333; white-space: pre-wrap; font-family: inherit;">${content}</pre>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666666; font-size: 12px; background-color: #f5f5f5;">
            <p>This note was shared from MindFlow.</p>
        </div>
      </div>
    `,
  }

    const result = await transporter.sendMail(mailOptions)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending note share email:", error)
    throw error
  }
}

export async function simulateWhatsAppShare(phoneNumber: string, content: string, title: string) {
  // WhatsApp sharing simulation
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(`*${title}*\n\n${content}`)}`

  return {
    success: true,
    method: "whatsapp",
    url: whatsappUrl,
    message: "WhatsApp share link generated"
  }
}
