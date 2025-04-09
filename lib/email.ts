import nodemailer from "nodemailer"

// Configure Mailtrap email transporter
export function getEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASSWORD || "",
    },
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = getEmailTransporter()

  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  const currentYear = new Date().getFullYear()

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MindFlow" <noreply@mindflow.com>',
    to: email,
    subject: "Verify your email address",
    text: `Please verify your email address by clicking on the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E40AF; padding: 20px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL}/assets/png%20ai.png" alt="MindFlow Logo" width="100" height="60" style="height: 60px; width: auto;">
        </div>
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; background-color: #ffffff;">
          <h2 style="color: #1E40AF; margin-top: 0;">Verify your email address</h2>
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">Thank you for signing up for MindFlow! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1E40AF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 16px;">Verify Email</a>
          </div>
          <p style="color: #666666; font-size: 14px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #666666; font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          <p style="color: #666666; font-size: 14px; margin-top: 30px;">If you didn't sign up for MindFlow, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666666; font-size: 12px; background-color: #f5f5f5;">
          <p>&copy; ${currentYear} MindFlow. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log("Email sent: %s", info.messageId)

  // For Mailtrap, you can log the preview URL
  if (process.env.NODE_ENV === "development") {
    console.log("Mailtrap preview URL: %s", `https://mailtrap.io/inboxes/`)
  }

  return info
}

export async function sendNoteShareEmail(email: string, noteContent: string, noteTitle: string) {
  const transporter = getEmailTransporter()
  const currentYear = new Date().getFullYear()

  // Format the note content for better readability
  const formattedContent = formatNoteContentForEmail(noteContent)
  const formattedActionItems = extractAndFormatActionItems(noteContent)

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MindFlow" <noreply@mindflow.com>',
    to: email,
    subject: `MindFlow Note: ${noteTitle}`,
    text: `Here's the note you requested from MindFlow:

${noteContent}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E40AF; padding: 20px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL}/assets/png%20ai.png" alt="MindFlow Logo" width="100" height="60" style="height: 60px; width: auto;">
        </div>
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; background-color: #ffffff;">
          <h2 style="color: #1E40AF; margin-top: 0;">${noteTitle}</h2>
          <p style="color: #666666; font-size: 14px;">Here's the note shared with you from MindFlow:</p>
          
          <div style="margin-top: 25px;">
            <h3 style="color: #333333; font-size: 18px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">Summary of Main Ideas</h3>
            <div style="background-color: #f5f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #1E40AF; margin-top: 15px;">
              ${formattedContent}
            </div>
          </div>
          
          ${
            formattedActionItems
              ? `
          <div style="margin-top: 25px;">
            <h3 style="color: #333333; font-size: 18px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">Action Items</h3>
            <div style="background-color: #f0fff4; padding: 20px; border-radius: 6px; border-left: 4px solid #22c55e; margin-top: 15px;">
              ${formattedActionItems}
            </div>
          </div>
          `
              : ""
          }
          
          <p style="color: #666666; font-size: 14px; margin-top: 30px;">This note was shared from a MindFlow conversation.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666666; font-size: 12px; background-color: #f5f5f5;">
          <p>&copy; ${currentYear} MindFlow. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log("Note share email sent: %s", info.messageId)

  return info
}

// Helper function to format note content for email
function formatNoteContentForEmail(content: string): string {
  if (!content) return '<p style="color: #666666;">No content available</p>'

  // Replace section headers with styled headers
  let formatted = content.replace(
    /\*\*(.*?)\*\*/g,
    '<h4 style="color: #1E40AF; margin-top: 20px; margin-bottom: 10px;">$1</h4>',
  )

  // Format bullet points
  formatted = formatted.replace(
    /- (.*?)(\n|$)/g,
    '<div style="display: flex; margin-bottom: 8px;"><span style="color: #1E40AF; margin-right: 8px;">•</span><span style="color: #333333;">$1</span></div>',
  )

  // Format paragraphs
  formatted = formatted.replace(/^(?!<h4|<div)(.*?)$/gm, '<p style="color: #333333; margin-bottom: 10px;">$1</p>')

  // Remove any action items section to be handled separately
  const actionItemsIndex = formatted.toLowerCase().indexOf("action items")
  if (actionItemsIndex !== -1) {
    formatted = formatted.substring(0, actionItemsIndex)
  }

  return formatted
}

// Helper function to extract and format action items
function extractAndFormatActionItems(content: string): string {
  if (!content) return ""

  // Check if there are action items
  const actionItemsIndex = content.toLowerCase().indexOf("action items")
  if (actionItemsIndex === -1) return ""

  // Extract the action items section
  const actionItemsSection = content.substring(actionItemsIndex)

  // Format bullet points
  let formatted = actionItemsSection.replace(
    /- (.*?)(\n|$)/g,
    '<div style="display: flex; margin-bottom: 8px;"><span style="color: #22c55e; margin-right: 8px;">✓</span><span style="color: #333333;">$1</span></div>',
  )

  // Format paragraphs
  formatted = formatted.replace(/^(?!<div)(.*?)$/gm, '<p style="color: #333333; margin-bottom: 10px;">$1</p>')

  // Remove the "Action Items:" header as we'll add our own
  formatted = formatted.replace(/<p[^>]*>Action Items:?<\/p>/i, "")

  return formatted
}

// Simulated WhatsApp sharing function (for demo purposes)
export async function simulateWhatsAppShare(phoneNumber: string, noteContent: string, noteTitle: string) {
  // In a real app, this would integrate with WhatsApp Business API
  // For demo purposes, we'll send an email to Mailtrap that simulates a WhatsApp message

  const transporter = getEmailTransporter()
  const currentYear = new Date().getFullYear()

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MindFlow WhatsApp" <whatsapp@mindflow.com>',
    to: process.env.ADMIN_EMAIL || "admin@mindflow.com", // In a real app, this would be converted to a WhatsApp message
    subject: `[SIMULATED WHATSAPP] Note shared to ${phoneNumber}`,
    text: `SIMULATED WHATSAPP MESSAGE

To: ${phoneNumber}

MindFlow Note: ${noteTitle}

${noteContent}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #25D366; padding: 20px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL}/assets/png%20ai.png" alt="MindFlow Logo" width="100" height="60" style="height: 60px; width: auto;">
          <h1 style="color: white; margin: 10px 0 0 0;">SIMULATED WHATSAPP MESSAGE</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p><strong>To:</strong> ${phoneNumber}</p>
          <h2>${noteTitle}</h2>
          <div style="background-color: #DCF8C6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            ${formatNoteContentForEmail(noteContent)}
          </div>
          <p><em>This is a simulated WhatsApp message for demonstration purposes.</em></p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666666; font-size: 12px; background-color: #f5f5f5;">
          <p>&copy; ${currentYear} MindFlow. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log("Simulated WhatsApp email sent: %s", info.messageId)

  return {
    success: true,
    messageId: info.messageId,
    to: phoneNumber,
  }
}
