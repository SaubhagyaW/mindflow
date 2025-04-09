"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="flex justify-center items-center gap-2">
          <Brain className="h-10 w-10 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">MindFlow</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Authentication Error
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">There was a problem with your authentication request.</p>
        <div className="mt-8 flex flex-col gap-4">
          <Link href="/sign-in">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Try signing in again</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

