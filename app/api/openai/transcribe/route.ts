import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic" // Disable caching for this route

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const SUPPORTED_FORMATS = ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm", "ogg", "flac"]

export async function POST(req: NextRequest) {
  console.log("🔄 [TRANSCRIBE] Request received for audio transcription")

  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio")
    console.log("📦 [TRANSCRIBE] FormData parsed")

    if (!audioFile || !(audioFile instanceof Blob)) {
      console.warn("⚠️ [TRANSCRIBE] Invalid or missing audio file")
      return NextResponse.json(
        {
          error: "Audio file is required and must be a Blob/File.",
        },
        { status: 400 },
      )
    }

    const fileName = audioFile instanceof File ? audioFile.name : "unnamed.webm"
    const fileType = audioFile.type || "audio/webm"
    const fileSize = audioFile.size

    console.log("📝 [TRANSCRIBE] Audio file details:", {
      name: fileName,
      type: fileType,
      size: fileSize,
    })

    if (fileSize < 1000) {
      console.warn("⚠️ [TRANSCRIBE] Audio file too small to process")
      return NextResponse.json({
        text: "",
        warning: "Audio file too small to process",
      })
    }

    const file = audioFile instanceof File
      ? audioFile
      : new File([audioFile], fileName, { type: fileType })

    console.log("📤 [TRANSCRIBE] Sending audio to OpenAI Whisper API...")

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    })

    console.log("✅ [TRANSCRIBE] Transcription success:", transcription.text)

    return NextResponse.json({
      text: transcription.text,
    })
  } catch (error: any) {
    console.error("❌ [TRANSCRIBE] Whisper API error:", error)

    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
