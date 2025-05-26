"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Loader2, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ShareNoteDialog } from "@/components/share-note-dialog"

interface VoiceConversationProps {
  onSave?: () => void
}

export function VoiceConversation({ onSave }: VoiceConversationProps) {
  const router = useRouter()
  // State variables
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const messagesRef = useRef<Array<{ role: string; content: string }>>([])
  const [conversationId, setConversationId] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [actionItems, setActionItems] = useState<string>("")
  const [showSummary, setShowSummary] = useState(false)
  const [fullTranscript, setFullTranscript] = useState<string>("")

  // Add a ref to track the current transcript being built
  const currentTranscriptRef = useRef<string>("");

  // Add a ref to track audio chunks for transcription (keeping for compatibility)
  const audioBufferRef = useRef<Float32Array[]>([]);
  const lastTranscriptionTimeRef = useRef<number>(0);

  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [status, setStatus] = useState<string>("idle")

  const [conversationStartTime, setConversationStartTime] = useState<number | null>(null)
  const [userSpeakingStartTime, setUserSpeakingStartTime] = useState<number | null>(null)
  const [aiSpeakingStartTime, setAiSpeakingStartTime] = useState<number | null>(null)
  const [totalUserSpeakingTime, setTotalUserSpeakingTime] = useState<number>(0)
  const [totalAiSpeakingTime, setTotalAiSpeakingTime] = useState<number>(0)
  const [totalConversationTime, setTotalConversationTime] = useState<number>(0)

  // Refs for WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const ephemeralTokenRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const sessionIdRef = useRef<string | null>(null)

  // Ref to store the complete conversation transcript
  const completeTranscriptRef = useRef<string>("")

  const { toast } = useToast()
  const { data: session } = useSession()

  // Add a queue for audio playback to prevent multiple voices talking at once
  const audioQueue = useRef<Array<{ url: string; transcript: string }>>([])
  const isPlayingAudio = useRef<boolean>(false)

  // Function to play the next audio in the queue
  const playNextInQueue = () => {
    if (audioQueue.current.length === 0 || isPlayingAudio.current) {
      return
    }

    isPlayingAudio.current = true
    const nextAudio = audioQueue.current.shift()

    if (nextAudio && audioElementRef.current) {
      audioElementRef.current.src = nextAudio.url
      audioElementRef.current.onended = () => {
        isPlayingAudio.current = false
        playNextInQueue()
      }
      audioElementRef.current.play().catch((err) => {
        console.error("Error playing audio:", err)
        isPlayingAudio.current = false
        playNextInQueue()
      })
    }
  }

  

  // Update the tab visibility handler to prevent refreshing when returning to tab
  // Add this effect to handle tab visibility changes
  useEffect(() => {
    // Function to handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab is now visible again")
        // Don't reconnect if we're already connected or in the process of connecting
        // or if we're showing the summary or if we haven't attempted a connection yet
        if (!isConnected && !isConnecting && !showSummary && connectionAttempts > 0) {
          console.log("Connection was lost while tab was hidden, reconnecting")
          // Only reinitialize if connection was previously established and then lost
          if (status === "disconnected" || status === "error") {
            initializeWebRTC()
          }
        }
      } else {
        console.log("Tab is now hidden")
        // Optionally pause audio or other resources when tab is hidden
        if (audioElementRef.current) {
          audioElementRef.current.pause()
        }
      }
    }

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isConnected, isConnecting, showSummary, connectionAttempts, status])

  // Add function to process audio for transcription
  const processUserAudio = async () => {
    console.log("processUserAudio called, speaking:", isUserSpeaking, "buffer size:", audioBufferRef.current.length);
    
    // Check if we have data to process
    if (audioBufferRef.current.length === 0) {
      console.log("No audio data in buffer, skipping transcription");
      return;
    }
    
    // Continue even if not speaking - we might have caught audio already
    
    // Combine audio buffers
    const totalLength = audioBufferRef.current.reduce((acc, arr) => acc + arr.length, 0);
    const combinedBuffer = new Float32Array(totalLength);
    let offset = 0;
    
    audioBufferRef.current.forEach(chunk => {
      combinedBuffer.set(chunk, offset);
      offset += chunk.length;
    });
    
    // Convert to WAV format
    try {
      console.log("Creating AudioContext...");
      const audioContext = new AudioContext({
        sampleRate: 16000 // Ensure proper sample rate for Whisper
      });
      
      console.log("Creating AudioBuffer...");
      const audioBuffer = audioContext.createBuffer(1, combinedBuffer.length, 16000);
      audioBuffer.copyToChannel(combinedBuffer, 0);
      
      // Convert to blob
      console.log("Converting to WAV...");
      const wav = audioBufferToWav(audioBuffer);
      const audioBlob = new Blob([wav], { type: 'audio/wav' });
      
      console.log("Audio blob created, size:", audioBlob.size);
      
      if (audioBlob.size < 1000) {
        console.log("Audio blob too small, likely no speech detected");
        // Clear buffer after checking
        audioBufferRef.current = [];
        return;
      }
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      
      // Add debugging for the request
      console.log("FormData created with audio blob:", {
        blobType: audioBlob.type,
        blobSize: audioBlob.size,
        formDataEntries: [...formData.entries()].map(entry => ({ key: entry[0], value: entry[1] instanceof Blob ? 'Blob' : typeof entry[1] }))
      });
      
      console.log("Sending request to: /api/openai/transcribe");
      const response = await fetch('/api/openai/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      console.log("Transcription response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Transcription API error:", errorText);
        throw new Error('Transcription failed: ' + errorText);
      }
      
      const data = await response.json();
      console.log("Transcription result:", data);
      
      if (data.text) {
        const userMessage = {
          role: "user",
          content: data.text
        };
        
        console.log("Adding transcribed user message:", userMessage);
        setMessages(prev => [...prev, userMessage]);
        messagesRef.current = [...messagesRef.current, userMessage];
        completeTranscriptRef.current += `You: ${data.text}\n\n`;
        setFullTranscript(completeTranscriptRef.current);
      }
    } catch (error) {
      console.error('Error transcribing user audio:', error);
    }
    
    // Clear buffer after processing
    audioBufferRef.current = [];
  };

  // Create audio element for AI speech
  useEffect(() => {
    const audioEl = new Audio()
    audioEl.autoplay = true
    audioEl.volume = 1.0 // Full volume
    audioElementRef.current = audioEl

    // Add event listeners for debugging
    audioEl.onplay = () => console.log("Audio started playing")
    audioEl.onpause = () => console.log("Audio paused")
    audioEl.onerror = (e) => {
      console.error("Audio error details:", {
        error: audioEl.error,
        code: audioEl.error?.code,
        message: audioEl.error?.message,
        networkState: audioEl.networkState,
        readyState: audioEl.readyState,
      })
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ""
      }
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Keep messagesRef in sync with state
  useEffect(() => {
    messagesRef.current = messages;
    console.log("Messages updated:", JSON.stringify(messages));
    console.log("MessagesRef updated:", JSON.stringify(messagesRef.current));
  }, [messages]);

  // Clean up WebRTC connection on unmount
  useEffect(() => {
    return () => {
      cleanupConnection()
    }
  }, [])

  // Auto-start connection when component mounts
  useEffect(() => {
    // Start connection automatically when component mounts
    if (!isConnected && !isConnecting) {
      initializeWebRTC()
    }
  }, [])

  // Thorough cleanup function
  const cleanupConnection = () => {
    console.log("Cleaning up connection...")

    // Clear any pending timeouts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = undefined
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = undefined
    }

    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      localStreamRef.current = null
    }

    // Close data channel
    if (dataChannelRef.current) {
      try {
        // Remove all event listeners
        dataChannelRef.current.onopen = null
        dataChannelRef.current.onclose = null
        dataChannelRef.current.onmessage = null
        dataChannelRef.current.onerror = null

        if (dataChannelRef.current.readyState !== "closed") {
          dataChannelRef.current.close()
        }
      } catch (e) {
        console.error("Error closing data channel:", e)
      }
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        // Remove all event listeners
        peerConnectionRef.current.oniceconnectionstatechange = null
        peerConnectionRef.current.onconnectionstatechange = null
        peerConnectionRef.current.onicegatheringstatechange = null
        peerConnectionRef.current.onsignalingstatechange = null
        peerConnectionRef.current.onicecandidate = null
        peerConnectionRef.current.onicecandidateerror = null
        peerConnectionRef.current.ontrack = null

        if (peerConnectionRef.current.signalingState !== "closed") {
          peerConnectionRef.current.close()
        }
      } catch (e) {
        console.error("Error closing peer connection:", e)
      }
      peerConnectionRef.current = null
    }

    // Reset audio element
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause()
        audioElementRef.current.srcObject = null
      } catch (e) {
        console.error("Error resetting audio element:", e)
      }
    }

    // Reset state
    setIsConnected(false)
    setIsUserSpeaking(false)
    setIsAiSpeaking(false)
    setStatus("idle")
    setConversationStartTime(null)
    setUserSpeakingStartTime(null)
    setAiSpeakingStartTime(null)
  }

  // Initialize WebRTC connection
  const initializeWebRTC = async () => {
    if (isConnected || isConnecting) {
      console.log("Already connected or connecting, not initializing again")
      return
    }

    // Clean up any existing connection first
    cleanupConnection()

    setIsConnecting(true)
    setConnectionError(null)
    setStatus("connecting")
    setConversationStartTime(Date.now())
    setTotalAiSpeakingTime(0)
    setTotalUserSpeakingTime(0)
    setTotalConversationTime(0)


    // Increment connection attempts
    setConnectionAttempts((prev) => prev + 1)

    // Set connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      if (isConnecting && !isConnected) {
        console.error("Connection timeout")
        setConnectionError("Connection timeout. Please try again.")
        setIsConnecting(false)
        setStatus("error")
        cleanupConnection()
      }
    }, 20000) // 20 second timeout

    try {
      // Get ephemeral token from server
      console.log("Requesting ephemeral token")
      const tokenResponse = await fetch("/api/openai/realtime-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get token: ${tokenResponse.status}`)
      }

      const tokenData = await tokenResponse.json()

      if (!tokenData.client_secret?.value) {
        throw new Error("Invalid token response")
      }

      const ephemeralToken = tokenData.client_secret.value
      ephemeralTokenRef.current = ephemeralToken
      console.log("Token received successfully")

      // Create peer connection with minimal configuration first
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        iceCandidatePoolSize: 10,
      })
      peerConnectionRef.current = pc

      // Set up event listeners
      pc.oniceconnectionstatechange = () => {
        

        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          
        } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          console.error(`ICE connection ${pc.iceConnectionState}`)
          setConnectionError(`Connection problem: ICE negotiation ${pc.iceConnectionState}`)
          setIsConnecting(false)
          setStatus("error")
        }
      }

      pc.onconnectionstatechange = () => {
        

        if (pc.connectionState === "connected") {
          console.log("WebRTC connection established")
        } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          console.error(`WebRTC connection ${pc.connectionState}`)
          setConnectionError(`WebRTC connection ${pc.connectionState}`)
          setIsConnecting(false)
          setStatus("error")
        }
      }

      // Log ICE candidates for debugging
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          
        }
      }

      // Set up audio playback
      pc.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind)
        if (event.track.kind === "audio") {
          console.log("Setting up audio playback for remote track")

          try {
            // Create a new MediaStream with just this audio track
            const stream = new MediaStream([event.track])

            // Make sure we have a valid audio element
            if (!audioElementRef.current) {
              audioElementRef.current = new Audio()
              audioElementRef.current.autoplay = false // Change to false to use our queue system
              audioElementRef.current.volume = 1.0
            }

            // Set the stream as source
            audioElementRef.current.srcObject = stream

            // Add more detailed error handling for audio playback
            audioElementRef.current.onerror = (e) => {
              console.error("Audio playback error:", audioElementRef.current?.error)
              isPlayingAudio.current = false
              playNextInQueue()
            }

            // Don't auto-play, we'll control playback with our queue
            audioElementRef.current.onended = () => {
              isPlayingAudio.current = false
              playNextInQueue()
            }
          } catch (trackError) {
            console.error("Error setting up audio track:", trackError)
          }
        }
      }

      // Get microphone access
      console.log("Requesting microphone access")
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        localStreamRef.current = mediaStream
        console.log("Microphone access granted")

        // Add audio track to peer connection
        mediaStream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, mediaStream)
          console.log("Added audio track to peer connection")
        })
      } catch (micError) {
        throw new Error(`Microphone access denied: ${micError instanceof Error ? micError.message : String(micError)}`)
      }

      // Create data channel with minimal options
      console.log("Creating data channel")
      const dataChannel = pc.createDataChannel("oai-events", {
        ordered: true,
      })
      dataChannelRef.current = dataChannel

      // Set up data channel event handlers
      dataChannel.onopen = () => {
        console.log("Data channel opened")
        setIsConnected(true)
        setIsConnecting(false)
        setStatus("connected")

        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
          connectionTimeoutRef.current = undefined
        }

        // Send a single consolidated system message that includes introduction instructions
        const systemEvent = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are MindFlow AI, an expert brainstorming partner designed to help users develop and organize their ideas. Your goal is to facilitate creative thinking, help structure thoughts, and identify actionable next steps. Ask thoughtful questions to explore ideas deeper, suggest connections between concepts, and help refine vague notions into concrete plans. Be supportive, insightful, and focused on helping the user achieve clarity in their thinking. Remember that your conversations will be summarized into key points and action items, so help guide the discussion toward meaningful outcomes. Start by introducing yourself as MindFlow AI briefly and ask what the user would like to brainstorm today in a friendly, encouraging tone.",
              },
            ],
          },
        }

        try {
          dataChannelRef.current?.send(JSON.stringify(systemEvent))
          console.log("✅ Sent consolidated system message with introduction instructions")
        } catch (err) {
          console.error("❌ Failed to send system message:", err)
        }

        toast({
          title: "Connected",
          description: "Ready for voice conversation",
        })
      }

      dataChannel.onclose = () => {
        console.log("Data channel closed")
        setIsConnected(false)
        setStatus("disconnected")
      }

      dataChannel.onerror = (error) => {
        console.error("Data channel error:", error)

        // Don't show error if we're intentionally disconnecting
        if (isConnected || isConnecting) {
          setConnectionError("Data channel error occurred")
          setIsConnected(false)
          setIsConnecting(false)
          setStatus("error")
        }
      }

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeEvent(data)
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      }

      // Create offer with minimal options
      console.log("Creating offer")
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })

      // Set local description
      await pc.setLocalDescription(offer)
      console.log("Local description set")

      // Wait for ICE gathering to complete or timeout after 5 seconds
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (pc.iceGatheringState === "complete") {
            resolve()
          }
        }

        pc.onicegatheringstatechange = checkState
        checkState() // Check immediately

        // Set timeout in case gathering takes too long
        setTimeout(resolve, 5000)
      })

      // Ensure we have a local description before proceeding
      if (!pc.localDescription || !pc.localDescription.sdp) {
        throw new Error("No local description available")
      }

      // Send offer to OpenAI
      console.log("Sending offer to OpenAI")
      const model = "gpt-4o-realtime-preview-2024-12-17"
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
        method: "POST",
        body: pc.localDescription.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1",
        },
      })

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        throw new Error(`OpenAI API error: ${sdpResponse.status} - ${errorText}`)
      }

      // Get answer from OpenAI
      const sdpAnswer = await sdpResponse.text()
      console.log("Received answer from OpenAI")

      // Set remote description
      await pc.setRemoteDescription({
        type: "answer",
        sdp: sdpAnswer,
      })
      console.log("Remote description set")

      // Initialize messages with the system prompt
      const systemMessage = {
        role: "system",
        content: "You are MindFlow AI, an expert brainstorming partner. Your goal is to help users develop their ideas through thoughtful questions and suggestions. Be creative, supportive, and insightful. Help users explore different perspectives and possibilities."
      };
      setMessages([systemMessage]);
      messagesRef.current = [systemMessage];
      console.log("Messages initialized with:", JSON.stringify(messagesRef.current));

      // Reset the complete transcript
      completeTranscriptRef.current = ""
      setFullTranscript("")
    } catch (error) {
      console.error("WebRTC initialization error:", error)
      setConnectionError(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsConnecting(false)
      setStatus("error")
      cleanupConnection()

      toast({
        title: "Connection failed",
        description: "Could not connect to voice service. Please try again.",
        variant: "destructive",
      })
    }
  }

 

  // Handle realtime events
  const handleRealtimeEvent = (event: any) => {
    if (!event || typeof event !== "object") {
      console.error("Invalid event received:", event)
      return
    }

    // Log all events to see what's being sent for debugging purposes
    console.log("Received event:", event.type, JSON.stringify(event, null, 2))

    switch (event.type) {
      case "session.created":
        const sessionId = event.session?.id;
        if (sessionId) {
          console.log("Session created:", sessionId);
          sessionIdRef.current = sessionId;

          const sessionUpdatePayload = {
            type: "session.update",
            session: {
              input_audio_transcription: {
                model: "whisper-1" ,
                language: "en" 
              }
            }
          };

          if (dataChannelRef.current?.readyState === "open") {
            dataChannelRef.current.send(JSON.stringify(sessionUpdatePayload));
            console.log("Sent session.update to enable Whisper transcription");
          } else {
            console.warn("Data channel not ready");
          }
        }
        break

      case "input_audio_buffer.speech_started":
        console.log("User speech started")
        setIsUserSpeaking(true)
        setStatus("user_speaking")
        setUserSpeakingStartTime(Date.now())
        // Clear current transcript when user starts speaking
        currentTranscriptRef.current = "";
        break

      case "input_audio_buffer.speech_stopped":
        console.log("User speech stopped")
        setIsUserSpeaking(false)
        setStatus("processing")

        if (userSpeakingStartTime) {
          const speakingDuration = (Date.now() - userSpeakingStartTime) / 1000 // in seconds
          setTotalUserSpeakingTime((prev) => prev + speakingDuration)
          setUserSpeakingStartTime(null)
        }
        
        // Process any audio data we've collected (legacy support)
        if (audioBufferRef.current.length > 0) {
          processUserAudio();
        }
        
        // If we have collected any transcript, save it as a user message
        if (currentTranscriptRef.current.trim() !== "") {
          const userMessage = {
            role: "user",
            content: currentTranscriptRef.current
          };
          
          console.log("Saving user message from collected transcript:", userMessage);
          setMessages(prev => [...prev, userMessage]);
          messagesRef.current = [...messagesRef.current, userMessage];
          completeTranscriptRef.current += `You: ${currentTranscriptRef.current}\n\n`;
          setFullTranscript(completeTranscriptRef.current);
          
          // Clear the current transcript for the next message
          currentTranscriptRef.current = "";
        }
        break

      // Add handlers for user transcription events
      case "conversation.item.input_audio_transcription.completed":
        if (event.transcript) {
          console.log("User transcription completed:", event.transcript);
          const userMessage = {
            role: "user",
            content: event.transcript
          };
          
          setMessages(prev => [...prev, userMessage]);
          messagesRef.current = [...messagesRef.current, userMessage];
          completeTranscriptRef.current += `You: ${event.transcript}\n\n`;
          setFullTranscript(completeTranscriptRef.current);
        }
        break

      // Alternative event name that might be used
      // case "input_audio_transcription.completed":
      //   if (event.transcript) {
      //     console.log("User input transcription completed:", event.transcript);
      //     const userMessage = {
      //       role: "user",
      //       content: event.transcript
      //     };
          
      //     setMessages(prev => [...prev, userMessage]);
      //     messagesRef.current = [...messagesRef.current, userMessage];
      //     completeTranscriptRef.current += `You: ${event.transcript}\n\n`;
      //     setFullTranscript(completeTranscriptRef.current);
      //   }
      //   break

      // Another possible event format
      // case "input_audio_buffer.transcription":
      //   if (event.transcript) {
      //     console.log("User speech transcribed:", event.transcript);
      //     const userMessage = {
      //       role: "user",
      //       content: event.transcript
      //     };
          
      //     setMessages(prev => [...prev, userMessage]);
      //     messagesRef.current = [...messagesRef.current, userMessage];
      //     completeTranscriptRef.current += `You: ${event.transcript}\n\n`;
      //     setFullTranscript(completeTranscriptRef.current);
      //   }
      //   break
        
      case "response.audio_transcript.delta":
        // Handle transcript deltas (partial transcripts)
        if (event.delta) {
          console.log("Received transcript delta:", event.delta);
          
          // This is more likely for AI responses, but could be user speech deltas too
          // Check if this is for user's speech vs AI response
          if (isUserSpeaking || status === "user_speaking") {
            // This is user speech
            currentTranscriptRef.current += event.delta;
            console.log("Updated user transcript:", currentTranscriptRef.current);
          }
        }
        break

      case "response.audio_transcript.done":
        // Capture complete AI response transcript
        if (event.transcript) {
          const aiMessage = {
            role: "assistant",
            content: event.transcript
          };
          
          setMessages(prev => [...prev, aiMessage]);
          messagesRef.current = [...messagesRef.current, aiMessage];
          completeTranscriptRef.current += `AI: ${event.transcript}\n\n`;
          setFullTranscript(completeTranscriptRef.current);
          console.log("Added AI message from transcript:", aiMessage);
        }
        break

      // case "conversation.item.created":
      //   // Capture both user and AI messages
      //   if (event.item && event.item.content) {
      //     let content = "";
      //     let role = event.item.role || "unknown";

      //     if (Array.isArray(event.item.content)) {
      //       event.item.content.forEach((part: any) => {
      //         if (part.type === "input_audio" && part.transcript) {
      //           content = part.transcript;
      //         } else if ((part.type === "text" || part.type === "output_text" || part.type === "input_text") && part.text) {
      //           content = part.text;
      //         }
      //       });
      //     } else if (typeof event.item.content === "string") {
      //       content = event.item.content;
      //     }

      //     if (content && role !== "system") {
      //       // Skip messages that contain the system instruction
      //       if (!(role === "user" && content.includes("[SYSTEM:"))) {
      //         const message = { role, content };
      //         console.log("Adding message to state from conversation item:", message);
              
      //         // Update both state and ref
      //         setMessages(prev => [...prev, message]);
      //         messagesRef.current = [...messagesRef.current, message];
              
      //         // Update complete transcript
      //         const speaker = role === "user" ? "You" : "AI";
      //         completeTranscriptRef.current += `${speaker}: ${content}\n\n`;
      //         setFullTranscript(completeTranscriptRef.current);
      //       }
      //     }
      //   }
      //   break

      case "audio_started":
        console.log("AI audio started")
        setIsAiSpeaking(true)
        setStatus("ai_speaking")
        setAiSpeakingStartTime(Date.now())
        break

      case "audio_stopped":
        console.log("AI audio stopped")
        setIsAiSpeaking(false)
        setStatus("idle")

        // ← NEW: Calculate and accumulate AI speaking time
        if (aiSpeakingStartTime) {
          const speakingDuration = (Date.now() - aiSpeakingStartTime) / 1000 // in seconds
          setTotalAiSpeakingTime((prev) => prev + speakingDuration)
          setAiSpeakingStartTime(null)
        }

        break

      // case "response.created":
      //   // This event indicates the AI is generating a response
      //   console.log("AI response creation started")
      //   setStatus("ai_thinking")
      //   break

      case "response.done":
        // This event indicates the AI has finished generating a response
        console.log("AI response creation completed")
        setStatus("idle")
        break

      case "error":
        console.error("API error:", event)
        const errorMessage = event.error?.message || "Unknown error"
        setConnectionError(`API error: ${errorMessage}`)
        setStatus("error")

        // Handle specific error types
        if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
          toast({
            title: "API Limit Reached",
            description: "You've reached the OpenAI API rate limit. Please try again later.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
        break

      case "input_audio_buffer.data":
        // We no longer need to manually store audio data as we're using the API's transcript
        break

     

      case "response.output_item.done":
        console.log("Output item completed")
        break

      case "response.audio.done":
        console.log("Audio completed")
        setIsAiSpeaking(false)
        setStatus("idle")
        break

      default:
        console.log("Unhandled event type:", event.type)
        break
    }
  }


    // ← NEW: Function to record conversation time
  const recordTime = async () => {
    if (!session?.user?.id) return

    // Calculate final times
    const finalConversationTime =
      Math.ceil(
        (totalConversationTime + (conversationStartTime ? (Date.now() - conversationStartTime) / 1000 : 0)) / 60,
      ) * 60 // Round up to nearest minute

    console.log(`Recording conversation time: ${finalConversationTime} seconds`)

    try {
      const response = await fetch("/api/user/record-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          seconds: finalConversationTime,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to record time: ${response.status}`)
      }

      console.log("Successfully recorded conversation time")
    } catch (error) {
      console.error("Error recording conversation time:", error)
    }
  }

  // End conversation and save to database
  const endConversation = async () => {
    await recordTime()
    // Always try to save, even if we think there's no conversation
    await saveConversation()
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)

    if (audioElementRef.current) {
      audioElementRef.current.muted = !isMuted
    }
  }

  // Add audio buffer to WAV converter function
  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const arrayBuffer = new ArrayBuffer(44 + buffer.length * bytesPerSample);
    const view = new DataView(arrayBuffer);
    
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + buffer.length * bytesPerSample, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, buffer.length * bytesPerSample, true);
    
    // Write the PCM samples
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(0)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  }
  
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Update the saveConversation function to navigate to the conversations tab
  const saveConversation = async () => {
    try {
      // ← NEW: Calculate total conversation time if still active
      if (conversationStartTime) {
        const conversationDuration = (Date.now() - conversationStartTime) / 1000 // in seconds
        setTotalConversationTime((prev) => prev + conversationDuration)
        setConversationStartTime(null)
      }
  
      // ← NEW: Add final user speaking time if still speaking
      if (userSpeakingStartTime) {
        const speakingDuration = (Date.now() - userSpeakingStartTime) / 1000
        setTotalUserSpeakingTime((prev) => prev + speakingDuration)
        setUserSpeakingStartTime(null)
      }
  
      // ← NEW: Add final AI speaking time if still speaking
      if (aiSpeakingStartTime) {
        const speakingDuration = (Date.now() - aiSpeakingStartTime) / 1000
        setTotalAiSpeakingTime((prev) => prev + speakingDuration)
        setAiSpeakingStartTime(null)
      }
  
      if (!session?.user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save conversations.",
          variant: "destructive",
        })
        return
      }
  
      setIsSaving(true)
  
      const title = "Voice Conversation " + new Date().toLocaleString()
      const fullTranscriptText = completeTranscriptRef.current || "Voice conversation transcript"
  
      console.log("Saving conversation with transcript:", fullTranscriptText)
      console.log("Saving with messages:", messagesRef.current)
  
      const saveResponse = await fetch("/api/conversations/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          transcript: fullTranscriptText,
          messages: messagesRef.current,
          userId: session.user.id,
        }),
      })
  
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        throw new Error(`Failed to save conversation: ${errorText}`)
      }
  
      const saveData = await saveResponse.json()
      console.log("Save successful, received data:", saveData)
  
      if (saveData.conversation && saveData.conversation.id) {
        setConversationId(saveData.conversation.id)
        setSummary(saveData.note?.content || "")
        setActionItems(saveData.note?.actionItems || "")
  
        toast({
          title: "Conversation saved",
          description: "Your conversation has been saved successfully.",
        })
  
        if (onSave) {
          onSave()
        }
  
        setShowSummary(true)
        cleanupConnection()
  
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        throw new Error("Failed to save conversation properly")
      }
    } catch (error) {
      console.error("Error saving conversation:", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save your conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  

  // Render summary view
  if (showSummary) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-white border-blue-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Conversation Summary</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
              <div className="bg-blue-50 p-4 rounded-md text-gray-700 whitespace-pre-line">
                {summary ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {summary
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((point, index) => (
                        <li key={index}>{point.replace(/^- /, "")}</li>
                      ))}
                  </ul>
                ) : (
                  "No summary available."
                )}
              </div>
            </div>

            {actionItems && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Items:</h4>
                <div className="bg-green-50 p-4 rounded-md text-gray-700 whitespace-pre-line">
                  <ul className="list-disc pl-5 space-y-2">
                    {actionItems
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((item, index) => (
                        <li key={index}>{item.replace(/^- /, "")}</li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              onClick={() => {
                setShowSummary(false)
                setMessages([])
                setConversationId("")
                setSummary("")
                setActionItems("")
                setFullTranscript("")
                completeTranscriptRef.current = ""
                initializeWebRTC()
              }}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              New Conversation
            </Button>

            {session?.user?.id && conversationId && (
              <ShareNoteDialog
                noteId={conversationId}
                noteTitle={
                  messages
                    .filter((msg) => msg.role === "user")[0]
                    ?.content.split(" ")
                    .slice(0, 5)
                    .join(" ") + "..." || "Conversation"
                }
              />
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Full Conversation</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="whitespace-pre-line text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {fullTranscript || completeTranscriptRef.current || "No transcript available"}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Get status message
  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to AI service..."
      case "connected":
        return "Connected. Start speaking..."
      case "user_speaking":
        return "Listening to you..."
      case "processing":
        return "Processing your speech..."
      case "ai_thinking":
        return "AI is thinking..."
      case "ai_speaking":
        return "AI is speaking..."
      case "error":
        return "Error occurred"
      case "disconnected":
        return "Disconnected"
      default:
        return "Ready for conversation"
    }
  }

  // Main conversation UI - simplified to just show status and controls
  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat container */}
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 rounded-lg bg-gray-50 p-4 shadow-inner">
        {!isConnected && !isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900">Starting voice conversation...</h3>
              <p className="text-sm text-gray-500">Please wait while we connect to the AI service</p>
            </div>
          </div>
        ) : isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="font-medium text-gray-900">Connecting...</h3>
            <p className="text-sm text-gray-500">Establishing secure connection to AI service</p>
          </div>
        ) : messages.length <= 1 ? (
          // Only system message or no messages yet
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 relative">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <Mic className="h-12 w-12 text-blue-600" />
                {isUserSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                )}
              </div>
            </div>
            <h3 className="font-medium text-gray-900">{getStatusMessage()}</h3>
            <p className="text-sm text-gray-500 mt-2">
              {isUserSpeaking ? "We're listening..." : "Start speaking to begin the conversation"}
            </p>
          </div>
        ) : (
          // Display conversation messages
          <div className="space-y-4 pb-2">
            {messages
              .filter((msg) => msg.role !== "system")
              .map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === "user" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <p className="text-xs font-medium mb-1 text-gray-500">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </p>
                  <p className="text-gray-700">{message.content}</p>
                </div>
              ))}
            <div ref={messagesEndRef} />

            {/* Status indicator */}
            <div className="flex items-center justify-center mt-4">
              <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 flex items-center">
                {isUserSpeaking ? (
                  <>
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                    Listening...
                  </>
                ) : isAiSpeaking ? (
                  <>
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                    AI speaking...
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    {getStatusMessage()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message display */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <div className="flex justify-between items-center">
            <span>{connectionError}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 text-xs border-red-300 hover:bg-red-100"
              onClick={() => initializeWebRTC()}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Button onClick={endConversation} variant="destructive" className="bg-red-500" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Square className="h-5 w-5 mr-2" />
              End Conversation & Save
            </>
          )}
        </Button>

        {isConnected && (
          <>
            <Button onClick={toggleMute} variant="outline" className="border-gray-300">
              {isMuted ? (
                <>
                  <VolumeX className="h-5 w-5 mr-2" />
                  Unmute AI
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5 mr-2" />
                  Mute AI
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {isConnecting && (
        <div className="flex items-center justify-center p-2 mt-2 bg-gray-50 rounded-md border border-gray-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">Connecting to AI service...</span>
        </div>
      )}
    </div>
  )
}
