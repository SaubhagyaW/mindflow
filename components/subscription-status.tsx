"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Clock, Calendar } from "lucide-react"
import { formatTime } from "@/lib/subscription"
import Link from "next/link"

type SubscriptionData = {
  plan: string
  timeLimit: number
  usedTime: number
  remainingTime: number
  isActive: boolean
  expiresAt: string | null
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/user/subscription")
        if (!response.ok) {
          throw new Error("Failed to fetch subscription data")
        }
        const data = await response.json()
        setSubscription(data)
      } catch (err) {
        setError("Could not load subscription data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-red-500">{error || "Subscription data unavailable"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format plan name for display
  const formatPlanName = (plan: string) => {
    switch (plan) {
      case "free":
        return "Free Plan"
      case "pro-10h":
        return "Pro Plan (10 hours)"
      case "pro-20h":
        return "Pro Plan (20 hours)"
      case "pro-unlimited":
        return "Pro Unlimited Plan"
      default:
        return plan.charAt(0).toUpperCase() + plan.slice(1)
    }
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    if (subscription.timeLimit <= 0 || subscription.remainingTime === -1) return 0
    const used = subscription.usedTime
    const total = subscription.timeLimit
    return Math.min(100, Math.round((used / total) * 100))
  }

  // Format expiry date
  const formatExpiryDate = () => {
    if (!subscription.expiresAt) return "Never expires"
    const date = new Date(subscription.expiresAt)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Your current plan and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{formatPlanName(subscription.plan)}</h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              subscription.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {subscription.isActive ? "Active" : "Expired"}
          </span>
        </div>

        {subscription.remainingTime !== -1 ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage</span>
                <span>
                  {formatTime(subscription.usedTime)} / {formatTime(subscription.timeLimit)}
                </span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {subscription.remainingTime > 0
                  ? `${formatTime(subscription.remainingTime)} remaining this month`
                  : "No time remaining this month"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Unlimited conversation time</span>
          </div>
        )}

        {subscription.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Expires on {formatExpiryDate()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {subscription.plan === "free" ? (
          <Button asChild className="w-full">
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild className="w-full">
            <Link href="/pricing">Manage Subscription</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
