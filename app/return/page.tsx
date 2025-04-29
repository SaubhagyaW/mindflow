"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { useState, useEffect } from 'react'

// Custom components for the ReactMarkdown renderer
const MarkdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-2xl font-bold mt-8 mb-3 text-gray-900 border-b pb-2 border-gray-200" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="my-4 text-gray-700 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="my-4 ml-6 list-disc text-gray-700" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="my-4 ml-6 list-decimal text-gray-700" {...props} />
  ),
  li: ({ node, children, ...props }) => (
    <li className="mb-2" {...props}>
      {children}
    </li>
  ),
  a: ({ node, ...props }) => (
    <a className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" {...props} target="_blank" rel="noopener noreferrer" />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="my-4 pl-4 border-l-4 border-gray-300 text-gray-600 italic" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  em: ({ node, ...props }) => (
    <em className="italic" {...props} />
  ),
  code: ({ node, inline, ...props }) => (
    inline ?
      <code className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-sm" {...props} /> :
      <code className="block p-4 my-4 rounded bg-gray-100 text-gray-800 font-mono text-sm overflow-x-auto" {...props} />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-8 border-gray-200" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-gray-300" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-gray-100" {...props} />
  ),
  tbody: ({ node, ...props }) => (
    <tbody className="divide-y divide-gray-300" {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="hover:bg-gray-50" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold text-gray-900" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="px-4 py-3 border border-gray-300 text-sm text-gray-700" {...props} />
  ),
};

export default function ReturnPage() {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const lastUpdated = "April 8, 2025" // Hardcoded date as fallback

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/assets/legal_contracts/return.md')

        if (!response.ok) {
          throw new Error('Failed to load return policy')
        }

        // Get the raw text from the markdown file
        const text = await response.text()

        // Simple parsing to remove frontmatter if present
        // This assumes frontmatter is enclosed in --- blocks at the start
        let processedContent = text

        if (text.startsWith('---')) {
          const endOfFrontmatter = text.indexOf('---', 3)
          if (endOfFrontmatter !== -1) {
            processedContent = text.slice(endOfFrontmatter + 3).trim()
          }
        }

        setContent(processedContent)
      } catch (error) {
        console.error('Error loading markdown file:', error)
        setContent('# Error Loading Return Policy\n\nWe apologize, but there was an error loading our return policy. Please try again later or contact us at support@mindflow.com.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

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
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
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
        <section className="bg-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Return Policy</h1>
              <p className="text-gray-600">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </section>

        {/* Return Policy Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Loading return policy...</span>
                </div>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
                </div>
              )}

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
                <li>
                  <Link href="/contact" className="text-blue-100 hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-blue-100 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-blue-100 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/return" className="text-blue-100 hover:text-white transition">
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-12 pt-8 text-center text-blue-100">
            <p>&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
