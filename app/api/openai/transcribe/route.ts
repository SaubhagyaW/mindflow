import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic" // Ensure this route is not cached

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio")

    if (!audioFile) {
      console.error("No audio file found in the request")
      return NextResponse.json(
        { error: "Audio file is required", details: "No file found in the request" },
        { status: 400 },
      )
    }

    console.log("Received audio file:", typeof audioFile)

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

    // Use OpenAI's Whisper API to transcribe the audio
    // The SDK can accept a Blob directly
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    })

    console.log("Transcription successful")

    return NextResponse.json({
      text: transcription.text,
    })
  } catch (error) {
    console.error("Error transcribing audio:", error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    )
  }
}

