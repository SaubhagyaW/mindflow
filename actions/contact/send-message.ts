"use server"

import { getEmailTransporter } from "@/lib/email"
import { z } from "zod"

// Define validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export async function sendContactMessage(formData: ContactFormData) {
  try {
    // Validate form data
    const validatedData = contactFormSchema.parse(formData)

    // Get email transporter
    const transporter = getEmailTransporter()

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MindFlow Contact Form" <contact@mindflow.com>',
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || "support@mindflow.com",
      replyTo: validatedData.email,
      subject: `Contact Form: ${validatedData.subject}`,
      text: `
Name: ${validatedData.name}
Email: ${validatedData.email}
Subject: ${validatedData.subject}

Message:
${validatedData.message}
      `,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E40AF; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MindFlow Contact Form</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; background-color: #ffffff;">
          <h2 style="color: #1E40AF; margin-top: 0;">New Contact Message</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; width: 100px; font-weight: bold;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${validatedData.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                <a href="mailto:${validatedData.email}" style="color: #1E40AF;">${validatedData.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${validatedData.subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #333333; font-size: 16px; margin-bottom: 10px;">Message:</h3>
          <div style="background-color: #f5f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #1E40AF;">
            <p style="color: #333333; white-space: pre-wrap;">${validatedData.message}</p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666666; font-size: 12px; background-color: #f5f5f5;">
          <p>This message was sent from the MindFlow contact form.</p>
        </div>
      </div>
      `,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)
    console.log("Contact form email sent: %s", info.messageId)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending contact form email:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.reduce(
          (acc, curr) => {
            acc[curr.path[0]] = curr.message
            return acc
          },
          {} as Record<string, string>,
        ),
      }
    }
    return { success: false, error: "Failed to send message. Please try again later." }
  }
}
