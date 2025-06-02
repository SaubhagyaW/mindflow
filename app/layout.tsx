import type React from "react"
import {Inter} from "next/font/google"
import {ThemeProvider} from "@/components/theme-provider"
import {Toaster} from "@/components/ui/toaster"
import {SessionProvider} from "@/components/session-provider"
import "./globals.css"

const inter = Inter({subsets: ["latin"]})

export const metadata = {
    title: {
        default: "MindFlow - AI-Powered Brainstorming | #1 Voice Brainstorming AI Assistant",
        template: "%s | MindFlow - Brainstorming AI"
    },
    description: "MindFlow is the leading AI-powered brainstorming platform that transforms voice conversations into organized ideas, notes, and action items. Experience intelligent brainstorming with our ChatGPT-powered voice assistant.",
    keywords: [
        "brainstorming AI",
        "AI brainstorming",
        "artificial intelligence brainstorming",
        "voice brainstorming",
        "AI voice assistant",
        "ChatGPT brainstorming",
        "brainstorming tool",
        "AI idea generation",
        "voice to text brainstorming",
        "intelligent brainstorming",
        "brainstorming software",
        "AI-powered ideation",
        "automated note taking",
        "voice conversation AI",
        "brainstorming assistant",
        "creative AI tool",
        "idea development AI",
        "brainstorming platform",
        "AI creativity tool",
        "voice brainstorming app"
    ].join(", "),
    authors: [{name: "MindFlow AI Team"}],
    creator: "MindFlow AI",
    publisher: "MindFlow AI",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://mind-flow.ai",
        siteName: "MindFlow - Brainstorming AI",
        title: "MindFlow - #1 AI-Powered Brainstorming Platform | Voice Brainstorming AI",
        description: "Transform your ideas with MindFlow's intelligent brainstorming AI. Chat with our voice assistant, get real-time responses, and automatically organize your thoughts into actionable plans.",
        images: [
            {
                url: "https://mind-flow.ai/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "MindFlow - AI-Powered Brainstorming Platform",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "MindFlow - AI Brainstorming Assistant | Voice-Powered Ideation",
        description: "Experience the future of brainstorming with MindFlow's AI voice assistant. Transform conversations into organized ideas and actionable insights.",
        images: ["https://mind-flow.ai/twitter-image.jpg"],
        creator: "@MindFlowAI",
        site: "@MindFlowAI",
    },
    verification: {
        google: "your-google-verification-code",
        bing: "your-bing-verification-code",
    },
    alternates: {
        canonical: "https://mind-flow.ai",
    },
    category: "Technology",
    classification: "AI Software, Brainstorming Tools, Voice Technology",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            {/* Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZCFT24PQEB"></script>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZCFT24PQEB');
            `,
                }}
            />

            {/* Enhanced SEO Meta Tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5"/>
            <meta name="theme-color" content="#3B82F6"/>
            <meta name="msapplication-TileColor" content="#3B82F6"/>
            <meta name="msapplication-config" content="/browserconfig.xml"/>

            {/* Preconnect to external domains */}
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>

            {/* Favicon and Icons */}
            <link rel="icon" href="/favicon.ico" sizes="any"/>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
            <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
            <link rel="manifest" href="/manifest.json"/>

            {/* Structured Data for Brainstorming AI */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "MindFlow - Brainstorming AI",
                        "applicationCategory": "ProductivityApplication",
                        "operatingSystem": "Web Browser",
                        "description": "AI-powered brainstorming platform that transforms voice conversations into organized ideas, notes, and action items using advanced ChatGPT technology.",
                        "url": "https://mind-flow.ai",
                        "author": {
                            "@type": "Organization",
                            "name": "MindFlow AI",
                            "url": "https://mind-flow.ai"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD",
                            "category": "Free with Premium Options"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "1250",
                            "bestRating": "5",
                            "worstRating": "1"
                        },
                        "keywords": "brainstorming AI, artificial intelligence brainstorming, voice brainstorming, AI assistant, ChatGPT brainstorming, idea generation, creative AI",
                        "featureList": [
                            "AI-powered voice brainstorming",
                            "Real-time conversation transcription",
                            "Automated note generation",
                            "Action item extraction",
                            "Team collaboration",
                            "Note sharing capabilities"
                        ]
                    })
                }}
            />

            {/* Organization Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "MindFlow AI",
                        "url": "https://mind-flow.ai",
                        "logo": "https://mind-flow.ai/logo.png",
                        "description": "Leading provider of AI-powered brainstorming and ideation solutions",
                        "foundingDate": "2023",
                        "founders": [
                            {
                                "@type": "Person",
                                "name": "MindFlow AI Team"
                            }
                        ],
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "Customer Service",
                            "email": "info@mg.mind-flow.ai",
                            "availableLanguage": "English"
                        },
                        "sameAs": [
                            "https://twitter.com/MindFlowAI",
                            "https://linkedin.com/company/mindflow-ai"
                        ]
                    })
                }}
            />

            {/* FAQ Schema for Brainstorming AI */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is brainstorming AI?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Brainstorming AI refers to artificial intelligence systems that assist in the creative ideation process. MindFlow's brainstorming AI uses advanced language models to engage in natural voice conversations, helping users develop and organize their ideas in real-time."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How does MindFlow's AI brainstorming work?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "MindFlow uses ChatGPT-powered voice technology to engage in natural conversations. As you speak, our AI responds intelligently, helping develop your ideas while automatically transcribing and organizing the conversation into structured notes and action items."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is MindFlow the best brainstorming AI tool?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "MindFlow is specifically designed for voice-based brainstorming with real-time AI interaction, automatic transcription, and intelligent organization features. It combines the power of ChatGPT with specialized brainstorming workflows to maximize creative productivity."
                                }
                            }
                        ]
                    })
                }}
            />

            {/* PayHere */}
            <script type="text/javascript" src="https://www.payhere.lk/lib/payhere.js"></script>

            {/* Preload critical resources */}
            <link rel="preload" href="/assets/hero.svg" as="image"/>
            <link rel="preload" href="/assets/png ai.png" as="image"/>
        </head>
        <body className={inter.className}>
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                {children}
                <Toaster/>
            </ThemeProvider>
        </SessionProvider>
        </body>
        </html>
    )
}
