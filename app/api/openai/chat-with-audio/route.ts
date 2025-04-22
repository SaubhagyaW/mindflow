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

    try {
      // Call OpenAI API for chat completion
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      })

      // Format the response text for better readability
      const messageContent = response.choices[0].message.content || ""
      const formattedContent = messageContent
        .replace(/(\d+\.\s+\*\*[^*]+\*\*)/g, "\n\n$1") // Add extra line breaks before numbered sections
        .replace(/(\n\s*\n\s*\n)/g, "\n\n") // Normalize multiple line breaks to just two
        .trim()

      // Generate speech from the formatted text response
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
        input: messageContent, // Use original content for speech
      })

      // Convert the audio to base64
      const buffer = Buffer.from(await speechResponse.arrayBuffer())
      const base64Audio = buffer.toString("base64")

      return NextResponse.json({
        message: {
          role: "assistant",
          content: formattedContent, // Use formatted content for display
        },
        audio: base64Audio,
        usage: response.usage,
      })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: openaiError instanceof Error ? openaiError.message : String(openaiError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in chat completion with audio:", error)
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
