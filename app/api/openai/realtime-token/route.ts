import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Requesting ephemeral token from OpenAI for user:", session.user.id)

    // Log the API key (first few characters only) for debugging
    const apiKey = process.env.OPENAI_API_KEY || ""
    console.log("OPENAI_API_KEY available:", apiKey ? `${apiKey.substring(0, 4)}...` : "No API key found")

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1", // Required beta header
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
      }),
    })

    // Log response status for debugging
    console.log("OpenAI token response status:", response.status)

    // Handle non-JSON responses
    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse OpenAI response:", responseText)
      return NextResponse.json({ error: "Invalid response from OpenAI", rawResponse: responseText }, { status: 500 })
    }

    if (!response.ok) {
      console.error("OpenAI token error:", responseData)
      let errorMessage = "Failed to get ephemeral token"
      if (response.status === 401) {
        errorMessage = "Invalid OpenAI API key"
      } else if (responseData?.error?.message?.includes("Token has expired")) {
        errorMessage = "Token has expired"
      }
      return NextResponse.json({ error: errorMessage, details: responseData }, { status: response.status })
    }

    console.log("Successfully obtained ephemeral token")

    // Return the ephemeral token to the client
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error getting ephemeral token:", error)
    return NextResponse.json(
      {
        error: "Failed to get ephemeral token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
