import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic" // Ensure this route is not cached

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Valid messages array is required" }, { status: 400 })
    }

    // Add system message for brainstorming context
    const systemMessage = {
      role: "system",
      content:
        "You are MindFlow AI, an expert brainstorming partner. Your goal is to help users develop their ideas through thoughtful questions and suggestions. Be creative, supportive, and insightful. Help users explore different perspectives and possibilities.",
    }

    const fullMessages = [systemMessage, ...messages]

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json({
      message: response.choices[0].message,
      usage: response.usage,
    })
  } catch (error) {
    console.error("Error in chat completion:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

