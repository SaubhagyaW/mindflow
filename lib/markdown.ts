import fs from "fs"
import path from "path"
import { remark } from "remark"
import html from "remark-html"
import matter from "gray-matter"

export async function getMarkdownContent(filePath: string) {
  try {
    // Construct the full path to the markdown file
    const fullPath = path.join(process.cwd(), filePath)

    // Read the file
    const fileContents = fs.readFileSync(fullPath, "utf8")

    // Use gray-matter to parse the metadata section
    const { content, data } = matter(fileContents)

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html, { sanitize: false }) // Don't sanitize to allow custom HTML
      .process(content)

    const contentHtml = processedContent.toString()

    // Return the HTML content and metadata
    return {
      contentHtml,
      metadata: data,
    }
  } catch (error) {
    console.error("Error reading markdown file:", error)
    return {
      contentHtml: "<p>Content not available</p>",
      metadata: {},
    }
  }
}
