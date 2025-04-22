// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useSession } from "next-auth/react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Mic, Square, Send, Loader2, Save } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { ShareNoteDialog } from "@/components/share-note-dialog"

// interface AudioRecorderProps {
//   onSave?: () => void
// }

// export function AudioRecorder({ onSave }: AudioRecorderProps) {
//   const [isRecording, setIsRecording] = useState(false)
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
//   const [audioUrl, setAudioUrl] = useState<string | null>(null)
//   const [transcript, setTranscript] = useState<string>("")
//   const [response, setResponse] = useState<string>("")
//   const [summary, setSummary] = useState<string>("")
//   const [actionItems, setActionItems] = useState<string>("")
//   const [conversationId, setConversationId] = useState<string>("")
//   const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
//   const [showSummary, setShowSummary] = useState(false)
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])
//   const { toast } = useToast()
//   const { data: session } = useSession()

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       const mediaRecorder = new MediaRecorder(stream)
//       mediaRecorderRef.current = mediaRecorder
//       audioChunksRef.current = []

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data)
//         }
//       }

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
//         setAudioBlob(audioBlob)

//         // Create a URL for the audio blob
//         const url = URL.createObjectURL(audioBlob)
//         setAudioUrl(url)

//         // Process the audio recording
//         processAudioRecording(audioBlob)
//       }

//       mediaRecorder.start()
//       setIsRecording(true)
//     } catch (error) {
//       console.error("Error accessing microphone:", error)
//       toast({
//         title: "Microphone access denied",
//         description: "Please allow microphone access to use this feature.",
//         variant: "destructive",
//       })
//     }
//   }

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop()
//       setIsRecording(false)

//       // Stop all audio tracks
//       mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
//     }
//   }

//   const processAudioRecording = async (audioBlob: Blob) => {
//     setIsProcessing(true)

//     try {
//       // Create a FormData object to send the audio blob directly
//       const formData = new FormData()

//       // Append the blob directly with a field name and filename with extension
//       formData.append("audio", audioBlob, "recording.wav")

//       console.log("Sending audio for transcription...")

//       // Send the audio to the OpenAI Whisper API for transcription
//       const transcriptionResponse = await fetch("/api/openai/transcribe", {
//         method: "POST",
//         body: formData,
//       })

//       if (!transcriptionResponse.ok) {
//         const responseData = await transcriptionResponse.json()
//         console.error("Transcription error:", responseData)
//         throw new Error(responseData.details || responseData.error || "Failed to transcribe audio")
//       }

//       const responseData = await transcriptionResponse.json()
//       const transcribedText = responseData.text
//       console.log("Transcription successful:", transcribedText)

//       setTranscript(transcribedText)

//       // Add user message to conversation
//       const updatedMessages = [...messages, { role: "user", content: transcribedText }]
//       setMessages(updatedMessages)

//       // Get AI response
//       await getAIResponse(updatedMessages)
//     } catch (error) {
//       console.error("Error processing audio:", error)
//       toast({
//         title: "Processing failed",
//         description: error instanceof Error ? error.message : "Failed to process your recording. Please try again.",
//         variant: "destructive",
//       })
//       setIsProcessing(false)
//     }
//   }

//   const getAIResponse = async (currentMessages: Array<{ role: string; content: string }>) => {
//     try {
//       // Call the OpenAI API to get a response
//       const chatResponse = await fetch("/api/openai/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           messages: currentMessages,
//         }),
//       })

//       if (!chatResponse.ok) {
//         throw new Error("Failed to get AI response")
//       }

//       const chatData = await chatResponse.json()
//       const aiResponseText = chatData.message.content

//       setResponse(aiResponseText)

//       // Add AI response to conversation
//       const updatedMessages = [
//         ...currentMessages,
//         {
//           role: "assistant",
//           content: aiResponseText,
//         },
//       ]
//       setMessages(updatedMessages)

//       // Generate summary and action items
//       await generateSummary(updatedMessages)
//     } catch (error) {
//       console.error("Error getting AI response:", error)
//       toast({
//         title: "Response failed",
//         description: "Failed to get AI response. Please try again.",
//         variant: "destructive",
//       })
//       setIsProcessing(false)
//     }
//   }

//   const generateSummary = async (conversationMessages: Array<{ role: string; content: string }>) => {
//     try {
//       // Create a transcript from the conversation messages
//       const fullTranscript = conversationMessages
//         .map((msg) => `${msg.role === "user" ? "You" : "AI"}: ${msg.content}`)
//         .join("\n\n")

//       // Call the OpenAI API to generate a summary
//       const summaryResponse = await fetch("/api/openai/summarize", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           transcript: fullTranscript,
//         }),
//       })

//       if (!summaryResponse.ok) {
//         throw new Error("Failed to generate summary")
//       }

//       const summaryData = await summaryResponse.json()
//       setSummary(summaryData.summary)
//       setActionItems(summaryData.actionItems)
//       setIsProcessing(false)
//     } catch (error) {
//       console.error("Error generating summary:", error)
//       toast({
//         title: "Summary generation failed",
//         description: "Failed to generate summary. Please try again.",
//         variant: "destructive",
//       })
//       setIsProcessing(false)
//     }
//   }

//   const handleSendMessage = async () => {
//     if (!transcript.trim()) return

//     setIsProcessing(true)

//     // Create updated messages array with user's text input
//     const updatedMessages = [...messages, { role: "user", content: transcript }]

//     setMessages(updatedMessages)

//     // Get AI response
//     await getAIResponse(updatedMessages)
//   }

//   const saveConversation = async () => {
//     if (!session?.user?.id) {
//       toast({
//         title: "Authentication required",
//         description: "Please sign in to save conversations.",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsSaving(true)

//     try {
//       // Generate a title from the conversation
//       const title = transcript.split(" ").slice(0, 5).join(" ") + "..."

//       // Create a transcript from the conversation messages
//       const fullTranscript = messages.map((msg) => `${msg.role === "user" ? "You" : "AI"}: ${msg.content}`).join("\n\n")

//       console.log("Saving conversation with:", {
//         title,
//         transcriptLength: fullTranscript.length,
//         messagesCount: messages.length,
//         userId: session.user.id,
//       })

//       // Save the conversation
//       const saveResponse = await fetch("/api/conversations/save", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           title,
//           transcript: fullTranscript,
//           messages,
//           userId: session.user.id,
//         }),
//       })

//       if (!saveResponse.ok) {
//         const errorData = await saveResponse.json()
//         console.error("Save response error:", errorData)
//         throw new Error(errorData.error || "Failed to save conversation")
//       }

//       const saveData = await saveResponse.json()
//       console.log("Save successful, received data:", saveData)

//       // Check if we have a valid conversation ID
//       if (saveData.conversation && saveData.conversation.id) {
//         setConversationId(saveData.conversation.id)
//       } else {
//         console.error("No conversation ID in response:", saveData)
//       }

//       toast({
//         title: "Conversation saved",
//         description: "Your conversation and notes have been saved successfully.",
//       })

//       // Call the onSave callback if provided
//       if (onSave) {
//         onSave()
//       }

//       // Show the summary after saving
//       setShowSummary(true)
//     } catch (error) {
//       console.error("Error saving conversation:", error)
//       toast({
//         title: "Save failed",
//         description: error instanceof Error ? error.message : "Failed to save your conversation. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   // Reset the conversation when component unmounts
//   useEffect(() => {
//     return () => {
//       if (mediaRecorderRef.current && isRecording) {
//         mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
//       }

//       // Clean up audio URL
//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl)
//       }
//     }
//   }, [isRecording, audioUrl])

//   let content = null

//   // If showing summary, render the summary view
//   if (showSummary) {
//     content = (
//       <div className="space-y-6">
//         <Card className="p-6 bg-white border-blue-200">
//           <h3 className="text-xl font-bold mb-4 text-gray-900">Conversation Summary</h3>
//           <div className="space-y-4">
//             <div>
//               <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
//               <div className="bg-blue-50 p-4 rounded-md text-gray-700 whitespace-pre-line">
//                 {summary || "No summary available."}
//               </div>
//             </div>

//             {actionItems && (
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Action Items:</h4>
//                 <div className="bg-blue-50 p-4 rounded-md text-gray-700 whitespace-pre-line">{actionItems}</div>
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap gap-3 mt-6">
//             <Button
//               onClick={() => {
//                 setShowSummary(false)
//                 setTranscript("")
//                 setResponse("")
//                 setSummary("")
//                 setActionItems("")
//                 setMessages([])
//                 setAudioBlob(null)
//                 if (audioUrl) {
//                   URL.revokeObjectURL(audioUrl)
//                   setAudioUrl(null)
//                 }
//               }}
//               variant="outline"
//               className="border-blue-600 text-blue-600 hover:bg-blue-50"
//             >
//               New Conversation
//             </Button>

//             {session?.user?.id && conversationId && (
//               <ShareNoteDialog
//                 noteId={conversationId}
//                 noteTitle={transcript.split(" ").slice(0, 5).join(" ") + "..."}
//               />
//             )}
//           </div>
//         </Card>

//         <Card className="p-6 bg-white border-gray-200">
//           <h3 className="text-lg font-medium mb-4 text-gray-900">Full Conversation</h3>
//           <div className="space-y-4 max-h-96 overflow-y-auto">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`p-3 rounded-lg ${
//                   message.role === "user" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"
//                 }`}
//               >
//                 <p className="text-xs font-medium mb-1 text-gray-500">
//                   {message.role === "user" ? "You" : "AI Assistant"}
//                 </p>
//                 <p className="text-gray-700">{message.content}</p>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>
//     )
//   } else {
//     content = (
//       <div className="space-y-4">
//         {!transcript && !response && (
//           <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
//             <div className="mb-4 text-center">
//               <h3 className="font-medium text-gray-900">Start a conversation</h3>
//               <p className="text-sm text-gray-500">Click the microphone to begin recording</p>
//             </div>
//             <Button
//               onClick={isRecording ? stopRecording : startRecording}
//               variant={isRecording ? "destructive" : "default"}
//               size="lg"
//               className={isRecording ? "bg-red-500" : "bg-blue-600 hover:bg-blue-700 text-white"}
//             >
//               {isRecording ? (
//                 <>
//                   <Square className="h-5 w-5 mr-2" />
//                   Stop Recording
//                 </>
//               ) : (
//                 <>
//                   <Mic className="h-5 w-5 mr-2" />
//                   Start Recording
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {isProcessing && (
//           <div className="flex items-center justify-center p-6">
//             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//             <span className="ml-2 text-gray-600">Processing your conversation...</span>
//           </div>
//         )}

//         {transcript && (
//           <Card className="p-4 bg-blue-50 border-blue-200">
//             <p className="font-medium text-sm text-blue-800 mb-2">You said:</p>
//             <p className="text-gray-800">{transcript}</p>
//           </Card>
//         )}

//         {response && (
//           <Card className="p-4 bg-gray-50 border-gray-200">
//             <p className="font-medium text-sm text-gray-800 mb-2">MindFlow AI:</p>
//             <p className="text-gray-800 whitespace-pre-line">{response}</p>
//           </Card>
//         )}

//         {(transcript || response) && (
//           <div className="flex flex-wrap items-center gap-2 mt-4">
//             <Button
//               onClick={startRecording}
//               variant="outline"
//               disabled={isRecording || isProcessing}
//               className="border-blue-600 text-blue-600 hover:bg-blue-50"
//             >
//               <Mic className="h-5 w-5 mr-2" />
//               Record Response
//             </Button>

//             <Button
//               onClick={handleSendMessage}
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//               disabled={isRecording || isProcessing || !transcript}
//             >
//               <Send className="h-5 w-5 mr-2" />
//               Send Message
//             </Button>

//             {response && (
//               <Button
//                 onClick={saveConversation}
//                 variant="outline"
//                 className="border-green-600 text-green-600 hover:bg-green-50"
//                 disabled={isRecording || isProcessing || isSaving}
//               >
//                 {isSaving ? (
//                   <>
//                     <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-5 w-5 mr-2" />
//                     Save Conversation
//                   </>
//                 )}
//               </Button>
//             )}
//           </div>
//         )}

//         {audioUrl && (
//           <div className="mt-4">
//             <p className="text-sm text-gray-500 mb-2">Recording preview:</p>
//             <audio controls src={audioUrl} className="w-full" />
//           </div>
//         )}
//       </div>
//     )
//   }

//   return <>{content}</>
// }
