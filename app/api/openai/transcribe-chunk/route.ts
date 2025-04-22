// This file is no longer used, but we'll update it to prevent errors if it's still being called
import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic" // Ensure this route is not cached

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Log that this deprecated endpoint is being called
    console.warn(
      "WARNING: The deprecated /api/openai/transcribe-chunk endpoint is being called. Please update your code to use /api/openai/transcribe instead.",
    )

    const formData = await req.formData()
    const audioFile = formData.get("audio")

    if (!audioFile) {
      console.error("No audio file found in the request")
      return NextResponse.json(
        { error: "Audio file is required", details: "No file found in the request" },
        { status: 400 },
      )
    }

    // Ensure we have a valid file
    if (!(audioFile instanceof Blob)) {
      return NextResponse.json(
        {
          error: "Invalid audio data",
          details: `Expected Blob but got ${typeof audioFile}`,
        },
        { status: 400 },
      )
    }

    // Check if the audio file is empty or too small
    if (audioFile.size < 1000) {
      return NextResponse.json({
        text: "", // Return empty text for very small audio chunks (likely silence)
        warning: "This endpoint is deprecated. Please use /api/openai/transcribe instead.",
      })
    }

    // Redirect to the main transcribe endpoint
    return NextResponse.json({
      text: "",
      warning: "This endpoint is deprecated. Please use /api/openai/transcribe instead.",
    })
  } catch (error) {
    console.error("Error in deprecated transcribe-chunk endpoint:", error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        error: "Failed to process request",
        details: errorMessage,
        warning: "This endpoint is deprecated. Please use /api/openai/transcribe instead.",
      },
      { status: 500 },
    )
  }
}
