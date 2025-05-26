"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { UpdateProfileForm } from "@/components/update-profile-form"
import { UpdatePasswordForm } from "@/components/update-password-form"
import { SubscriptionStatus } from "@/components/subscription-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  // Fetch user profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile()
    } else if (status !== "loading") {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile`, {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else {
        console.error("Failed to fetch user profile:", await response.json())
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile update success
  const handleProfileUpdated = async (name: string) => {
    // Update the session with the new name
    await update({ name })

    // Force a session refresh
    router.refresh()

    // Refresh the profile data
    fetchUserProfile()
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and subscription</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <SubscriptionStatus />

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your profile information and password</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="mt-4">
                    <UpdateProfileForm
                      currentName={profile?.name || session?.user?.name || ""}
                      onSuccess={handleProfileUpdated}
                    />
                  </TabsContent>
                  <TabsContent value="password" className="mt-4">
                    <UpdatePasswordForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Your conversation and usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Conversations</span>
                    <span className="font-medium">Coming soon</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Conversation Time</span>
                    <span className="font-medium">Coming soon</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Conversation Length</span>
                    <span className="font-medium">Coming soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </DashboardShell>
  )
}
