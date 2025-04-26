import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - MindFlow",
  description: "MindFlow's privacy policy and data protection practices",
}

export default function PrivacyPolicyPage() {
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: April 8, 2025</p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="prose max-w-none">
                <p>
                  At MindFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our service. Please read this privacy policy
                  carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>

                <h2>Information We Collect</h2>
                <p>We collect information that you provide directly to us, including:</p>
                <ul>
                  <li>
                    <strong>Personal Information:</strong> When you create an account, we collect your name, email
                    address, and password.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> If you subscribe to a paid plan, we collect payment details,
                    which are processed by our secure payment processors.
                  </li>
                  <li>
                    <strong>User Content:</strong> We collect the content of your conversations, notes, and any other
                    information you provide through our service.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> We automatically collect information about your interactions with our
                    service, including the pages you view, the features you use, and the time spent on the platform.
                  </li>
                </ul>

                <h2>How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, security alerts, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Develop new products and services</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our service</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                  <li>Personalize and improve your experience</li>
                </ul>

                <h2>Sharing of Information</h2>
                <p>We may share your information in the following circumstances:</p>
                <ul>
                  <li>
                    <strong>With Service Providers:</strong> We may share your information with third-party vendors,
                    consultants, and other service providers who need access to such information to carry out work on
                    our behalf.
                  </li>
                  <li>
                    <strong>For Legal Reasons:</strong> We may disclose your information if we believe it is necessary
                    to comply with a legal obligation, protect our rights or the rights of others, or investigate fraud.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> If MindFlow is involved in a merger, acquisition, or sale of
                    all or a portion of its assets, your information may be transferred as part of that transaction.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> We may share your information with third parties when you have
                    given us your consent to do so.
                  </li>
                </ul>

                <h2>Data Security</h2>
                <p>
                  We take reasonable measures to help protect your personal information from loss, theft, misuse, and
                  unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over
                  the Internet or method of electronic storage is 100% secure.
                </p>

                <h2>Your Choices</h2>
                <p>You have several choices regarding the use of your information:</p>
                <ul>
                  <li>
                    <strong>Account Information:</strong> You can update your account information through your account
                    settings.
                  </li>
                  <li>
                    <strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually
                    choose to set your browser to remove or reject browser cookies.
                  </li>
                  <li>
                    <strong>Promotional Communications:</strong> You can opt out of receiving promotional emails from us
                    by following the instructions in those emails.
                  </li>
                </ul>

                <h2>Children's Privacy</h2>
                <p>
                  Our service is not directed to children under 13, and we do not knowingly collect personal information
                  from children under 13. If we learn we have collected personal information from a child under 13, we
                  will delete this information.
                </p>

                <h2>Changes to This Privacy Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the
                  new privacy policy on this page and updating the "Last Updated" date at the top of this policy.
                </p>

                <h2>Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@mindflow.com" className="text-blue-600 hover:underline">
                    privacy@mindflow.com
                  </a>
                  .
                </p>
              </div>

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
                  <Link href="/about" className="text-blue-100 hover:text-white transition">
                    About
                  </Link>
                </li>
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
