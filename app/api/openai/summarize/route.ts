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
      console.error("Invalid transcript received:", transcript)
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 })
    }

    console.log(`Summarizing transcript of length: ${transcript.length} characters`)

    // Check if transcript is too short or empty
    if (transcript.length < 10 || transcript === "No transcript available") {
      console.log("Transcript too short or empty, returning default message")
      return NextResponse.json({
        summary: "The conversation was too short to generate a meaningful summary.",
        actionItems: "",
      })
    }

    // Truncate very long transcripts if needed
    const maxLength = 15000
    let processedTranscript = transcript
    if (transcript.length > maxLength) {
      console.log(`Transcript too long (${transcript.length} chars), truncating to ${maxLength} chars`)
      processedTranscript = transcript.substring(0, maxLength) + "\n\n[Transcript truncated due to length]"
    }

    try {
      // Log the first 200 characters of the transcript for debugging
      console.log("Transcript preview:", processedTranscript.substring(0, 200) + "...")

      // Check if the transcript contains actual conversation content
      const hasUserContent = processedTranscript.includes("You:")
      const hasAIContent = processedTranscript.includes("AI:")

      if (!hasUserContent || !hasAIContent) {
        console.warn("Transcript may not contain proper conversation format. Missing 'You:' or 'AI:' markers.")
      }

      // Call OpenAI API to summarize the conversation
      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at summarizing conversations and extracting key points and action items. Create a concise bullet-point summary of the main ideas and a separate list of action items if any are mentioned or implied. Format your response with 'Summary:' followed by bullet points, then 'Action Items:' followed by bullet points. If the input doesn't contain a meaningful conversation, indicate that in your response.",
          },
          {
            role: "user",
            content: `Please summarize this conversation and extract any action items:

${processedTranscript}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 800,
      })

      const summaryContent = summaryResponse.choices[0].message.content || ""
      console.log("Generated summary content length:", summaryContent.length)
      console.log("Summary content preview:", summaryContent.substring(0, 200) + "...")

      // Split the content into summary and action items
      let summary = summaryContent
      let actionItems = ""

      // Try to extract action items with different possible formats
      if (summaryContent.includes("Action Items:")) {
        const parts = summaryContent.split("Action Items:")
        summary = parts[0].trim()
        actionItems = parts[1].trim()
      } else if (summaryContent.includes("Action items:")) {
        const parts = summaryContent.split("Action items:")
        summary = parts[0].trim()
        actionItems = parts[1].trim()
      } else if (summaryContent.includes("ACTION ITEMS:")) {
        const parts = summaryContent.split("ACTION ITEMS:")
        summary = parts[0].trim()
        actionItems = parts[1].trim()
      }

      // Clean up the summary if it starts with "Summary:"
      if (summary.startsWith("Summary:")) {
        summary = summary.substring("Summary:".length).trim()
      }

      console.log("Successfully generated summary and action items")
      return NextResponse.json({
        summary,
        actionItems,
        usage: summaryResponse.usage,
      })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)

      // Try to extract more detailed error information
      const errorMessage = openaiError instanceof Error ? openaiError.message : String(openaiError)
      const errorDetails =
        openaiError instanceof Error && (openaiError as any).response ? (openaiError as any).response.data : null

      if (errorDetails) {
        console.error("OpenAI error details:", errorDetails)
      }

      return NextResponse.json(
        {
          error: "OpenAI API error",
          message: errorMessage,
          details: errorDetails,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
