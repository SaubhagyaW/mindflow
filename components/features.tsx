import { Mic, Save, FileText, Share2, Trash2, UserCircle } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <UserCircle className="h-10 w-10 text-primary" />,
      title: "User Authentication",
      description: "Secure sign-up and sign-in with easy profile management.",
    },
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Audio Conversations",
      description: "Talk naturally with an AI brainstorming partner powered by OpenAI's ChatGPT Voice.",
    },
    {
      icon: <Save className="h-10 w-10 text-primary" />,
      title: "Conversation Storage",
      description: "Automatically transcribe and store your conversations for future reference.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Note Generation",
      description: "Get bullet-point summaries and action items extracted from your conversations.",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Easy Sharing",
      description: "Share your notes with contacts via WhatsApp or Email (Premium).",
    },
    {
      icon: <Trash2 className="h-10 w-10 text-primary" />,
      title: "Conversation Management",
      description: "View history and delete conversations as needed (Premium).",
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Powerful Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Everything you need to capture, organize, and share your ideas
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              {feature.icon}
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

