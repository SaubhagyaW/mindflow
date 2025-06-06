"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function EmergencySessionReset() {
    const { data: session, update } = useSession()
    const { toast } = useToast()

    const handleResetSession = async () => {
        try {
            console.log("Resetting session verification status...")

            // Force session update
            await update({ isVerified: true })

            toast({
                title: "Session reset",
                description: "Session verification status has been updated.",
            })

            // Reload page to ensure clean state
            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (error) {
            console.error("Error resetting session:", error)
            toast({
                title: "Error",
                description: "Failed to reset session",
                variant: "destructive",
            })
        }
    }

    const handleSignOut = () => {
        window.location.href = "/api/auth/signout"
    }

    if (!session?.user) return null

    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Session Fix</h3>
            <p className="text-red-700 mb-4">
                If you're stuck in a verification loop, use these emergency options:
            </p>
            <div className="flex gap-2">
                <Button
                    onClick={handleResetSession}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                >
                    Reset Session
                </Button>
                <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-gray-300"
                >
                    Sign Out & Sign In Again
                </Button>
            </div>
        </div>
    )
}
