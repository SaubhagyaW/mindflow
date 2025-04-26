import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact MindFlow",
  description: "Get in touch with the MindFlow team",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/png ai.png" alt="MindFlow Logo" width={40} height={40} className="h-16 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">
              About
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-blue-600 transition">
              Services
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link href="/contact" className="text-blue-600 font-medium">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="hidden md:inline-flex border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
              <p className="text-xl text-gray-600 mb-8">
                Have questions about MindFlow? We're here to help. Reach out to our team and we'll get back to you as
                soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form and our team will get back to you within 24 hours. We're always happy to hear from
                  you!
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-gray-600">support@mindflow.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Phone</h3>
                      <p className="text-gray-600">+94 (77) 550 7684</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Office</h3>
                      <p className="text-gray-600">1200/4, Rajamalwatta Road, Battaramulla, Sri Lanka</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Send us a message</CardTitle>
                    <CardDescription>We'll get back to you as soon as possible.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <Input id="name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <Input id="email" type="email" placeholder="john.doe@example.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <Input id="subject" placeholder="How can we help you?" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message
                        </label>
                        <Textarea id="message" placeholder="Your message here..." rows={5} />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Send Message
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>

              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What is MindFlow AI Voice Brainstorming?</h3>
                  <p className="text-gray-700">
                    MindFlow is an AI-powered voice brainstorming assistant that helps you capture, organize, and share ideas through natural conversations. Using ChatGPT Voice technology, MindFlow transcribes your spoken thoughts, generates organized notes, and extracts action items automatically.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How does MindFlow's AI voice assistant work?</h3>
                  <p className="text-gray-700">
                    MindFlow uses advanced speech recognition and AI technology to transform your spoken words into text. As you talk, the AI assistant responds in real-time, helping develop your ideas while automatically organizing the conversation into searchable transcripts, summary notes, and actionable items.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Who can benefit from using MindFlow?</h3>
                  <p className="text-gray-700">
                    MindFlow is ideal for professionals across various fields including business strategists, creative professionals, writers, project managers, entrepreneurs, researchers, and anyone who needs to capture and organize ideas efficiently. Teams also benefit from the collaboration features in our Enterprise plan.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What makes MindFlow different from other note-taking apps?</h3>
                  <p className="text-gray-700">
                    Unlike traditional note-taking applications, MindFlow uses conversational AI to actively participate in your brainstorming process. The system not only records and transcribes but also responds intelligently to help develop your ideas, automatically organizes your thoughts, and generates structured outputs without manual effort.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How accurate is MindFlow's transcription?</h3>
                  <p className="text-gray-700">
                    MindFlow uses OpenAI's advanced transcription technology, which offers high accuracy for clear speech in English. The system continues to improve with use and works best in quiet environments with minimal background noise.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How does MindFlow handle my data and conversations?</h3>
                  <p className="text-gray-700">
                    MindFlow prioritizes data security and privacy. All conversations are encrypted during transmission and storage. We do not use your conversation content to train our models without explicit permission, and you maintain ownership of all your content.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I delete my conversation history?</h3>
                  <p className="text-gray-700">
                    Yes, Pro and Enterprise users can delete individual conversations or their entire conversation history at any time. Free users have limited conversation management capabilities but can still request data deletion through customer support.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a free version of MindFlow?</h3>
                  <p className="text-gray-700">
                    Yes, MindFlow offers a free plan that includes up to 3 saved conversations, basic transcription, and essential note generation features. This allows you to experience the core functionality before upgrading to a paid plan.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What do I get with the Pro plan?</h3>
                  <p className="text-gray-700">
                    The Pro plan ($19/month) includes unlimited conversations, advanced note generation, conversation management (create, delete) and the ability to share notes via email or WhatsApp. It's designed for individual professionals who need comprehensive brainstorming tools.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Does MindFlow offer team collaboration features?</h3>
                  <p className="text-gray-700">
                    Our Enterprise plan will soon unlock powerful team productivity tools including shared conversation workspaces, customizable role-based permissions, real-time team notifications, interactive comment threads, and comprehensive action item management with task assignment capabilities and status tracking dashboards—transforming how teams brainstorm and execute ideas together.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I start my first conversation with MindFlow?</h3>
                  <p className="text-gray-700">
                    After creating an account, simply click "New Conversation" on your dashboard, allow microphone access when prompted, and begin speaking. The AI assistant will respond in real-time, and your conversation will be automatically transcribed and organized.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How can I share my brainstorming results with others?</h3>
                  <p className="text-gray-700">
                    MindFlow automatically generates shareable notes from your conversations. Pro and Enterprise users can share these notes directly via email or WhatsApp with colleagues or team members. Enterprise users enjoy additional team sharing features through shared workspaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-blue-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/assets/png ai.png"
                  alt="MindFlow Logo"
                  width={24}
                  height={24}
                  className="h-16 w-auto rounded-2xl"
                />
              </div>
              <p className="text-blue-100">AI-Powered Voice Brainstorming: Transform Ideas into Action with MindFlow</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services" className="text-blue-100 hover:text-white transition">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-blue-100 hover:text-white transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                {/* <li>
                  <Link href="/about" className="text-blue-100 hover:text-white transition">
                    About
                  </Link>
                </li> */}
                <li>
                  <Link href="/contact" className="text-blue-100 hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            {/* <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-blue-100 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-blue-100 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-blue-700 mt-12 pt-8 text-center text-blue-100">
            <p>&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
