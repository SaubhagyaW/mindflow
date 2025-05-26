import type {Metadata} from "next"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Mail, MapPin, Phone} from "lucide-react"
import {SiteHeader} from "@/components/site-header"
import {SiteFooter} from "@/components/site-footer"
import ContactForm from "@/components/contact-form"

export const metadata: Metadata = {
    title: "Contact MindFlow",
    description: "Get in touch with the MindFlow team",
}

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <SiteHeader/>

            <main className="flex-1 pt-24">
                {/* Hero Section */}
                <section className="bg-blue-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Have questions about MindFlow? We're here to help. Reach out to our team and we'll get
                                back to you as
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
                                    Fill out the form and our team will get back to you within 24 hours. We're always
                                    happy to hear from
                                    you!
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <Mail className="h-6 w-6 text-blue-600"/>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Email</h3>
                                            <p className="text-gray-600">support@mindflow.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <Phone className="h-6 w-6 text-blue-600"/>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Phone</h3>
                                            <p className="text-gray-600">+94 (77) 550 7622</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <MapPin className="h-6 w-6 text-blue-600"/>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Office</h3>
                                            <p className="text-gray-600">225, Sama Mawatha, Battaramulla, Sri
                                                Lanka</p>
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
                                        <ContactForm/>
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
                            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked
                                Questions</h2>

                            <div className="space-y-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What is MindFlow AI Voice
                                        Brainstorming?</h3>
                                    <p className="text-gray-700">
                                        MindFlow is an AI-powered voice brainstorming assistant that helps you capture,
                                        organize, and share ideas through natural conversations. Using ChatGPT Voice
                                        technology, MindFlow transcribes your spoken thoughts, generates organized
                                        notes, and extracts action items automatically.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">How does MindFlow's AI
                                        voice assistant work?</h3>
                                    <p className="text-gray-700">
                                        MindFlow uses advanced speech recognition and AI technology to transform your
                                        spoken words into text. As you talk, the AI assistant responds in real-time,
                                        helping develop your ideas while automatically organizing the conversation into
                                        searchable transcripts, summary notes, and actionable items.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Who can benefit from using
                                        MindFlow?</h3>
                                    <p className="text-gray-700">
                                        MindFlow is ideal for professionals across various fields including business
                                        strategists, creative professionals, writers, project managers, entrepreneurs,
                                        researchers, and anyone who needs to capture and organize ideas efficiently.
                                        Teams also benefit from the collaboration features in our Enterprise plan.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What makes MindFlow
                                        different from other note-taking apps?</h3>
                                    <p className="text-gray-700">
                                        Unlike traditional note-taking applications, MindFlow uses conversational AI to
                                        actively participate in your brainstorming process. The system not only records
                                        and transcribes but also responds intelligently to help develop your ideas,
                                        automatically organizes your thoughts, and generates structured outputs without
                                        manual effort.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">How accurate is MindFlow's
                                        transcription?</h3>
                                    <p className="text-gray-700">
                                        MindFlow uses OpenAI's advanced transcription technology, which offers high
                                        accuracy for clear speech in English. The system continues to improve with use
                                        and works best in quiet environments with minimal background noise.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">How does MindFlow handle my
                                        data and conversations?</h3>
                                    <p className="text-gray-700">
                                        MindFlow prioritizes data security and privacy. All conversations are encrypted
                                        during transmission and storage. We do not use your conversation content to
                                        train our models without explicit permission, and you maintain ownership of all
                                        your content.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I delete my
                                        conversation history?</h3>
                                    <p className="text-gray-700">
                                        Yes, Pro and Enterprise users can delete individual conversations or their
                                        entire conversation history at any time. Free users have limited conversation
                                        management capabilities but can still request data deletion through customer
                                        support.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a free version of
                                        MindFlow?</h3>
                                    <p className="text-gray-700">
                                        Yes, MindFlow offers a free plan that includes up to 3 saved conversations,
                                        basic transcription, and essential note generation features. This allows you to
                                        experience the core functionality before upgrading to a paid plan.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What do I get with the Pro
                                        plan?</h3>
                                    <p className="text-gray-700">
                                        The Pro plan ($19/month) includes unlimited conversations, advanced note
                                        generation, conversation management (create, delete) and the ability to share
                                        notes via email or WhatsApp. It's designed for individual professionals who need
                                        comprehensive brainstorming tools.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Does MindFlow offer team
                                        collaboration features?</h3>
                                    <p className="text-gray-700">
                                        Our Enterprise plan will soon unlock powerful team productivity tools including
                                        shared conversation workspaces, customizable role-based permissions, real-time
                                        team notifications, interactive comment threads, and comprehensive action item
                                        management with task assignment capabilities and status tracking
                                        dashboards—transforming how teams brainstorm and execute ideas together.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I start my first
                                        conversation with MindFlow?</h3>
                                    <p className="text-gray-700">
                                        After creating an account, simply click "New Conversation" on your dashboard,
                                        allow microphone access when prompted, and begin speaking. The AI assistant will
                                        respond in real-time, and your conversation will be automatically transcribed
                                        and organized.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">How can I share my
                                        brainstorming results with others?</h3>
                                    <p className="text-gray-700">
                                        MindFlow automatically generates shareable notes from your conversations. Pro
                                        and Enterprise users can share these notes directly via email or WhatsApp with
                                        colleagues or team members. Enterprise users enjoy additional team sharing
                                        features through shared workspaces.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter/>
        </div>
    )
}
