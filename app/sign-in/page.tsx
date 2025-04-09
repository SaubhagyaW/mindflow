import type { Metadata } from "next"
import SignInClientPage from "./SignInClientPage"

export const metadata: Metadata = {
  title: "Sign In - MindFlow",
  description: "Sign in to your MindFlow account",
}

export default function SignInPage() {
  return <SignInClientPage />
}

