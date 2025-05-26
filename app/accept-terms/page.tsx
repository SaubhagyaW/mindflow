
export const dynamic = "force-dynamic"


import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { TermsAcceptance } from "@/components/terms-acceptance"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import fs from "fs"
import path from "path"
import { remark } from "remark"
import html from "remark-html"

// Function to read and process markdown files
async function getMarkdownContent(filename: string) {
  const filePath = path.join(process.cwd(), "content", filename)
  

  const fileContent = fs.readFileSync(filePath, "utf8")
  

  // Process markdown to HTML
  const processedContent = await remark().use(html).process(fileContent)
  

  return processedContent.toString()
}

// This is a server component
export default async function AcceptTermsPage(props: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  console.log("Rendering AcceptTermsPage...")

  const session = await getServerSession(authOptions)
  console.log("User session:", session)

  if (!session?.user) {
    console.log("User not authenticated. Redirecting to /sign-in")
    redirect("/sign-in")
  }

  if (session.user.hasAcceptedTerms) {
    console.log("User has already accepted terms. Redirecting to /dashboard")
    redirect("/dashboard")
  }

  // Load markdown contents
  const termsContent = await getMarkdownContent("terms.md")
  const privacyContent = await getMarkdownContent("privacy.md")
  const returnPolicyContent = await getMarkdownContent("return-policy.md")

  

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        <TermsAcceptance
          termsContent={termsContent}
          privacyContent={privacyContent}
          returnPolicyContent={returnPolicyContent}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
