"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    payhere?: {
      onCompleted: (orderId: string) => void
      onDismissed: () => void
      onError: (error: string) => void
      startPayment: (payment: any) => void
    }
  }
}

interface PayHereButtonProps {
  amount: number
  orderId: string
  itemName: string
  userId: string
  planDetails: string
  buttonText?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  customerInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    country: string
  }
}

export function PayHereButton({
  amount,
  orderId,
  itemName,
  userId,
  planDetails,
  buttonText = "Pay Now",
  className = "",
  variant = "default",
  customerInfo = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "0771234567",
    address: "Test Address",
    city: "Colombo",
    country: "Sri Lanka",
  },
}: PayHereButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [sdkChecked, setSdkChecked] = useState(false)
  const { toast } = useToast()

  // Check if PayHere SDK is loaded
  useEffect(() => {
    const checkSdk = () => {
      if (typeof window !== "undefined" && window.payhere) {
        setSdkLoaded(true)
      } else {
        setSdkLoaded(false)
      }
      setSdkChecked(true)
    }

    // Check immediately
    checkSdk()

    // Also set up a timer to check again after a delay
    const timer = setTimeout(checkSdk, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Double-check if PayHere SDK is loaded
      if (!window.payhere) {
        console.error("PayHere SDK not loaded")
        toast({
          title: "Payment Error",
          description: "Payment gateway not loaded. Please refresh the page and try again.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Format amount to exactly 2 decimal places as a string
      const formattedAmount = amount.toFixed(2)
      console.log("Amount being sent to hash endpoint:", formattedAmount)

      // Get hash from server
      const response = await fetch("/api/payments/payhere/hash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount: formattedAmount,
          currency: "USD",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate payment hash")
      }

      const { hash } = await response.json()
      console.log("Hash received from server:", hash)

      // Set up payment object exactly as in PayHere docs
      const payment = {
        sandbox: true, // Always use true for testing
        merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
        
        return_url: `${window.location.origin}/api/payments/payhere/success?orderId=${orderId}`,
        cancel_url: `${window.location.origin}/api/payments/payhere/cancel?orderId=${orderId}`,
        notify_url: `${window.location.origin}/api/payments/payhere/notify`,
        order_id: orderId,
        items: itemName,
        amount: formattedAmount,
        currency: "USD",
        hash: hash,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        country: customerInfo.country,
        custom_1: userId,
        custom_2: planDetails,
      }
      console.log("merchant_id:", process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID);


      console.log("Payment object:", payment)

      // Set up event handlers
      window.payhere.onCompleted = function onCompleted(orderId: string) {
        console.log("Payment completed. OrderID:" + orderId)
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        })
        setIsLoading(false)
        // Redirect to dashboard or reload page
        window.location.href = "/dashboard?payment=success&order=" + orderId
      }

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed")
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the payment process.",
          variant: "destructive",
        })
        setIsLoading(false)
      }

      window.payhere.onError = function onError(error: string) {
        console.log("Error:" + error)
        toast({
          title: "Payment Error",
          description: `An error occurred: ${error}`,
          variant: "destructive",
        })
        setIsLoading(false)
      }

      // Start payment
      window.payhere.startPayment(payment)
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Show loading state while checking SDK
  if (!sdkChecked) {
    return (
      <Button disabled className={className} variant={variant}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Show error state if SDK not loaded
  if (sdkChecked && !sdkLoaded) {
    return (
      <Button onClick={() => window.location.reload()} className={className} variant="destructive">
        Payment Gateway Error - Click to Reload
      </Button>
    )
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className={className} variant={variant}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  )
}
