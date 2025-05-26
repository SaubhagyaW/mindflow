"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayHereButton } from "@/components/payment/payhere-button"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"

export function PricingClientPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [currentIndex, setCurrentIndex] = useState(0)

  const plans = [
    {
      name: "Free",
      description: "Try MindFlow with limited features",
      price: { monthly: 0, annual: 0 },
      features: ["Real-time audio conversations with AI assistant", "Basic conversation transcription", "Up to 30 minutes conversation time", "Automated note generation", "Action item extraction"],
      highlight: false,
      planId: "free",
      available: true,
    },
    {
      name: "Pro 2h",
      description: "For individual brainstormers",
      price: { monthly: 15, annual: 11 },
      features: ["Real-time audio conversations with AI assistant", "Basic conversation transcription", "Up to 2 hours conversation time", "Automated note generation", "Action item extraction", "Note sharing via Email", "Manage conversations"],
      highlight: true,
      planId: "pro-2h",
      available: true,
    },
    {
      name: "Pro 5h",
      description: "For individual brainstormers",
      price: { monthly: 19, annual: 15 },
      features: ["Real-time audio conversations with AI assistant", "Basic conversation transcription", "Up to 5 hours conversation time", "Automated note generation", "Action item extraction", "Note sharing via Email", "Manage conversations"],
      highlight: false,
      planId: "pro-5h",
      available: true,
    },
    {
      name: "Pro 10h",
      description: "For individual brainstormers",
      price: { monthly: 25, annual: 22 },
      features: ["Real-time audio conversations with AI assistant", "Basic conversation transcription", "Up to 10 hours conversation time", "Automated note generation", "Action item extraction", "Note sharing via Email", "Manage conversations"],
      highlight: false,
      planId: "pro-10h",
      available: true,
    },
    {
      name: "Enterprise",
      description: "For teams and collaboration",
      price: { monthly: 0, annual: 0 },
      features: ["Everything in Pro Plan", "Team collaboration workspace", "Shared conversation spaces", "Team note sharing", "Comment system on conversations", "Project management tools", "Team notifications system"],
      highlight: false,
      planId: "enterprise",
      available: false,
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, plans.length - 2))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, plans.length - 2)) % Math.max(1, plans.length - 2))
  }

  // Create a reusable function for the card footer logic
  const renderCardFooter = (plan) => (
    <CardFooter>
      {plan.available ? (
        plan.price[billingCycle] === 0 ? (
          <Button variant="outline" className="w-full" onClick={() => router.push("/sign-up")}>
            Get Started
          </Button>
        ) : session ? (
          <PayHereButton
            amount={plan.price[billingCycle] * (billingCycle === "annual" ? 12 : 1)}
            orderId={`order-${Date.now()}`}
            itemName={`${plan.name} (${billingCycle})`}
            userId={session.user.id}
            planDetails={`${plan.planId}:${billingCycle}`}
            buttonText="Upgrade Now"
            className="w-full"
          />
        ) : (
          <Button className="w-full" onClick={() => router.push("/sign-in?callbackUrl=/pricing")}>
            Sign In to Upgrade
          </Button>
        )
      ) : (
        <Button disabled className="w-full">
          Coming Soon
        </Button>
      )}
    </CardFooter>
  )

  const renderPlanCard = (plan, index) => {
    const isVisible = index >= currentIndex && index < currentIndex + 3
    
    return (
      <div 
        key={plan.name}
        className="min-w-[280px] w-[280px]"
      >
        <Card 
          className={`
            flex flex-col transition-all duration-300 ease-out h-full
            ${plan.highlight ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}
            hover:shadow-xl hover:border-primary/50 hover:ring-2 hover:ring-primary/10 hover:-translate-y-1
            ${isVisible ? "opacity-100" : "opacity-60"}
          `}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plan.name}
              {plan.highlight && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                ${plan.price[billingCycle]}
              </span>
              {plan.price[billingCycle] > 0 && (
                <span className="text-muted-foreground ml-1">
                  /month
                </span>
              )}
            </div>
            {billingCycle === "annual" && plan.price.annual > 0 && (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Billed annually (${plan.price.annual * 12}/year)
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0 mr-3" />
                  <span className="text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          {renderCardFooter(plan)}
        </Card>
      </div>
    )
  }

  const renderTabContent = () => (
    <div className="relative">
      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        onClick={prevSlide}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        onClick={nextSlide}
        disabled={currentIndex >= plans.length - 3}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Cards Container */}
      <div className="overflow-hidden px-16 py-8">
        <div 
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 292}px)` }}
        >
          {plans.map((plan, index) => renderPlanCard(plan, index))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.max(1, plans.length - 2) }).map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl text-center mb-10">
        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-lg">Choose the plan that's right for you</p>
      </div>

      <Tabs defaultValue="monthly" className="mx-auto max-w-7xl">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger 
              value="monthly" 
              onClick={() => setBillingCycle("monthly")}
              className="px-6 py-2 rounded-md transition-all"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="annual" 
              onClick={() => setBillingCycle("annual")}
              className="px-6 py-2 rounded-md transition-all"
            >
              Annual 
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                Save up to 36%
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="mt-0">
          {renderTabContent()}
        </TabsContent>

        <TabsContent value="annual" className="mt-0">
          {renderTabContent()}
        </TabsContent>
      </Tabs>

      <div className="mx-auto max-w-2xl text-center mt-16">
        <h3 className="text-2xl font-semibold mb-4">Need a custom plan?</h3>
        <p className="text-muted-foreground text-lg mb-6">
          Contact us for custom pricing options for larger teams or specific requirements.
        </p>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => router.push("/contact")}
          className="px-8"
        >
          Contact Sales
        </Button>
      </div>
    </div>
  )
}
