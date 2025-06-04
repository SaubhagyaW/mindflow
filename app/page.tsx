import type {Metadata} from "next"
import {HomeClient} from "./HomeClient"

export const metadata: Metadata = {
    title: "MindFlow - AI-Powered Brainstorming | #1 Voice Brainstorming AI Assistant",
    description: "MindFlow is the leading AI-powered brainstorming platform that transforms voice conversations into organized ideas, notes, and action items. Experience intelligent brainstorming with our ChatGPT-powered voice assistant.",
    alternates: {
        canonical: "https://www.mind-flow.ai",
    },
    openGraph: {
        title: "MindFlow - #1 AI-Powered Brainstorming Platform | Voice Brainstorming AI",
        description: "Transform your ideas with MindFlow's intelligent brainstorming AI. Chat with our voice assistant, get real-time responses, and automatically organize your thoughts into actionable plans.",
        url: "https://www.mind-flow.ai",
    },
}

export default function Home() {
    return <HomeClient/>
}
