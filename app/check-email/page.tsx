"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="flex justify-center items-center gap-2">
          <Image src="/assets/png ai.png" alt="MindFlow Logo" width={40} height={40} className="h-16 w-auto" />
        </Link>

        <div className="mt-10 bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mt-4 text-gray-900">Check Your Email</h2>
            <p className="text-gray-500 mt-2 text-center">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify
              your account.
            </p>
            <div className="mt-6 space-y-4 w-full">
              <Link href="/sign-in">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Back to Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full text-gray-700 hover:text-blue-600">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            Didn't receive an email? Check your spam folder or{" "}
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              try signing up again
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

