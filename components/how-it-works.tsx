import Image from "next/image"
import { Mic, FileText, Share2 } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Mic className="h-8 w-8 text-primary" />,
      title: "Speak Your Thoughts",
      description:
        "Start a conversation with your AI brainstorming partner. Discuss ideas, problems, or plans naturally.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Get Organized Notes",
      description:
        "MindFlow automatically generates bullet-point summaries and extracts action items from your conversation.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Share and Collaborate",
      description: "Share your notes with colleagues or friends via WhatsApp or Email with a single click.",
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How MindFlow Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              A simple three-step process to transform your thoughts into actionable insights
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">{step.icon}</div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block h-0.5 w-full bg-muted absolute left-0 right-0" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative h-[300px] w-full max-w-[800px] rounded-xl overflow-hidden">
            <Image src="/placeholder.svg?height=300&width=800" alt="MindFlow in action" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

