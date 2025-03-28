import Link from "next/link"
import { Check, X } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      description: "For casual users",
      price: "$0",
      period: "forever",
      features: [
        { name: "Up to 3 conversations", included: true },
        { name: "Basic audio conversations", included: true },
        { name: "Conversation storage", included: true },
        { name: "Basic note generation", included: true },
        { name: "Delete conversations", included: false },
        { name: "Share notes with contacts", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Basic",
      description: "For single users",
      price: "$9.99",
      period: "per month",
      features: [
        { name: "Unlimited conversations", included: true },
        { name: "Advanced audio conversations", included: true },
        { name: "Conversation storage", included: true },
        { name: "Advanced note generation", included: true },
        { name: "Delete conversations", included: true },
        { name: "Share notes with contacts", included: true },
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Standard",
      description: "For teams",
      price: "$19.99",
      period: "per month",
      features: [
        { name: "Unlimited conversations", included: true },
        { name: "Advanced audio conversations", included: true },
        { name: "Team conversation storage", included: true },
        { name: "Advanced note generation", included: true },
        { name: "Team collaboration", included: true },
        { name: "Advanced sharing options", included: true },
      ],
      cta: "Coming Soon",
      popular: false,
      disabled: true,
    },
  ]

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Choose the plan that works best for you
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-lg border p-6 shadow-sm ${
                plan.popular ? "border-primary shadow-md" : ""
              }`}
            >
              {plan.popular && (
                <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                    ) : (
                      <X className="mr-2 h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href={plan.disabled ? "#" : "/services"}
                  className={`inline-flex h-10 w-full items-center justify-center rounded-md px-8 text-sm font-medium shadow transition-colors ${
                    plan.disabled
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted hover:bg-muted/90"
                  } focus-visible:outline-none focus-visible:ring-1`}
                  aria-disabled={plan.disabled}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

