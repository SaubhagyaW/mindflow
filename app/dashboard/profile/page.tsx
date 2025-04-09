"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Lock, CreditCard } from "lucide-react"
import { UpdateProfileForm } from "@/components/update-profile-form"
import { UpdatePasswordForm } from "@/components/update-password-form"
import { format } from "date-fns"

type UserProfile = {
  id: string
  name: string
  email: string
  createdAt: string
  subscription: {
    plan: string
    createdAt: string
  }
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

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

  // Format the subscription plan name for display
  const formatPlanName = (plan: string) => {
    if (!plan) return "Unknown"
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch (error) {
      return "Invalid date"
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
      <DashboardHeader heading="Profile Settings" text="Manage your account settings and preferences." />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and update your profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
                  <div className="mt-3 border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                      <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-900">Name</dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          {profile?.name || session?.user?.name || "Not available"}
                        </dd>
                      </div>
                      <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-900">Email</dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          {profile?.email || session?.user?.email || "Not available"}
                        </dd>
                      </div>
                      <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-900">Current Plan</dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          {formatPlanName(profile?.subscription?.plan || session?.user?.subscription?.plan || "free")}
                        </dd>
                      </div>
                      <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-900">Member Since</dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          {formatDate(profile?.createdAt || "")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Update Profile</h3>
                  <div className="mt-3">
                    <UpdateProfileForm
                      currentName={profile?.name || session?.user?.name || ""}
                      onSuccess={handleProfileUpdated}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Manage your subscription plan and billing information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatPlanName(profile?.subscription?.plan || session?.user?.subscription?.plan || "free")} Plan
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {profile?.subscription?.plan === "free"
                        ? "Limited to 3 conversations"
                        : "Unlimited conversations and premium features"}
                    </p>
                    {profile?.subscription?.createdAt && (
                      <p className="mt-1 text-xs text-gray-500">
                        Active since: {formatDate(profile.subscription.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0">
                    {profile?.subscription?.plan === "free" ? (
                      <a
                        href="/pricing"
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Upgrade Plan
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => alert("This feature is not available in the demo")}
                      >
                        Manage Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

