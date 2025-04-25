"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Share2, Mail, Phone, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

interface ShareNoteDialogProps {
  noteId: string
  noteTitle: string
  onShareSuccess?: () => void
}

export function ShareNoteDialog({ noteId, noteTitle, onShareSuccess }: ShareNoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [method, setMethod] = useState<"email" | "whatsapp">("email")
  const [recipient, setRecipient] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()

  // Check if user has a paid subscription
  // const isPaidUser = session?.user && session.user.subscription && session.user.subscription.plan !== "free"
  const isPaidUser = true

  const handleShare = async () => {
    if (!recipient) {
      toast({
        title: "Recipient required",
        description: method === "email" ? "Please enter an email address" : "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    if (!isPaidUser) {
      toast({
        title: "Upgrade required",
        description: "Sharing notes is only available for paid users. Please upgrade your plan.",
        variant: "destructive",
      })
      setIsOpen(false)
      return
    }

    // Check if user's email is verified
    if (!session?.user?.isVerified) {
      toast({
        title: "Email verification required",
        description: "Please verify your email address before sharing notes.",
        variant: "destructive",
      })
      setIsOpen(false)
      return
    }

    setIsSharing(true)

    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          recipient,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to share note")
      }

      toast({
        title: "Note shared",
        description: `Your note has been shared via ${method === "email" ? "email" : "WhatsApp"}.`,
      })

      setIsOpen(false)
      setRecipient("")

      // Call the onShareSuccess callback if provided
      if (onShareSuccess) {
        onShareSuccess()
      }
    } catch (error) {
      console.error("Error sharing note:", error)
      toast({
        title: "Sharing failed",
        description: error instanceof Error ? error.message : "Failed to share your note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
          <Share2 className="h-4 w-4 mr-2" />
          Share Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>Share "{noteTitle}" with others via email or WhatsApp.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(value as "email" | "whatsapp")}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="email" id="email" className="peer sr-only" />
              <Label
                htmlFor="email"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Mail className="mb-3 h-6 w-6" />
                Email
              </Label>
            </div>
            <div>
              <RadioGroupItem value="whatsapp" id="whatsapp" className="peer sr-only" />
              <Label
                htmlFor="whatsapp"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Phone className="mb-3 h-6 w-6" />
                WhatsApp
              </Label>
            </div>
          </RadioGroup>
          <div className="grid gap-2">
            <Label htmlFor="recipient">{method === "email" ? "Email Address" : "Phone Number"}</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={method === "email" ? "john.doe@example.com" : "+1234567890"}
            />
          </div>
          {!isPaidUser && (
            <div className="text-sm text-red-500 font-medium">
              <p>Note sharing is only available for paid users. Please upgrade your plan to use this feature.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="border-gray-300">
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || !isPaidUser}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
