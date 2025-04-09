import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic" // Ensure this route is not cached

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json()

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 })
    }

    // Call OpenAI API to summarize the conversation
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at summarizing conversations and extracting key points and action items. Create a concise bullet-point summary of the main ideas and a separate list of action items if any are mentioned or implied.",
        },
        {
          role: "user",
          content: `Please summarize this conversation and extract any action items:

${transcript}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    const summaryContent = summaryResponse.choices[0].message.content || ""

    // Split the content into summary and action items
    let summary = summaryContent
    let actionItems = ""

    if (summaryContent.includes("Action Items:")) {
      const parts = summaryContent.split("Action Items:")
      summary = parts[0].trim()
      actionItems = parts[1].trim()
    }

    return NextResponse.json({
      summary,
      actionItems,
      usage: summaryResponse.usage,
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}

