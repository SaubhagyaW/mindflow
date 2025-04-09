import type { Metadata } from "next"
import SignUpClientPage from "./SignUpClientPage"

export const metadata: Metadata = {
  title: "Sign Up - MindFlow",
  description: "Create your MindFlow account",
}

export default function SignUpPage() {
  return <SignUpClientPage />
}

