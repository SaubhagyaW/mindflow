import type {Metadata} from "next"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {ArrowLeft} from "lucide-react"
import {SiteHeader} from "@/components/site-header"
import {SiteFooter} from "@/components/site-footer"
import {getMarkdownContent} from "@/lib/markdown"

export const metadata: Metadata = {
  title: "Privacy Policy - MindFlow",
  description: "MindFlow's privacy policy and data protection practices",
  alternates: {
    canonical: "https://www.mind-flow.ai/privacy", // ✅ Changed to match page URL
  },
  openGraph: {
    title: "Privacy Policy - MindFlow",
    description: "How we protect and manage your data",
    url: "https://www.mind-flow.ai/privacy", // ✅ Changed to www version
  },
}

export default async function PrivacyPolicyPage() {
  const { contentHtml } = await getMarkdownContent("content/privacy.md")

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteHeader />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600">How we protect and manage your data</p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />

              <div className="mt-12">
                <Link href="/">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
