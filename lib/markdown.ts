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

    // Wrap the converted HTML with markdown-style CSS
    const styledContent = `
      <div class="markdown-body">
        ${contentHtml}
      </div>
      <style>
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #24292f;
          max-width: none;
        }
        
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }
        
        .markdown-body h1 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 10px; }
        .markdown-body h2 { font-size: 1.25em; border-bottom: 1px solid #d0d7de; padding-bottom: 8px; }
        .markdown-body h3 { font-size: 1.1em; }
        .markdown-body h4 { font-size: 1em; }
        .markdown-body h5 { font-size: 0.9em; }
        .markdown-body h6 { font-size: 0.85em; color: #656d76; }
        
        .markdown-body p { margin-bottom: 16px; }
        
        .markdown-body code {
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          background-color: #f6f8fa;
          border-radius: 6px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        
        .markdown-body pre {
          background-color: #f6f8fa;
          border-radius: 6px;
          font-size: 85%;
          line-height: 1.45;
          overflow: auto;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .markdown-body pre code {
          background: transparent;
          border: 0;
          display: inline;
          line-height: inherit;
          margin: 0;
          max-width: auto;
          padding: 0;
          white-space: pre;
          word-wrap: normal;
        }
        
        .markdown-body blockquote {
          padding: 0 1em;
          color: #656d76;
          border-left: 0.25em solid #d0d7de;
          margin: 0 0 16px 0;
        }
        
        .markdown-body ul, .markdown-body ol {
          padding-left: 2em;
          margin-bottom: 16px;
          list-style: initial;
        }
        
        .markdown-body ul {
          list-style-type: disc;
        }
        
        .markdown-body ol {
          list-style-type: decimal;
        }
        
        .markdown-body li {
          margin: 0.25em 0;
          display: list-item;
        }
        
        .markdown-body a {
          color: #0969da;
          text-decoration: none;
        }
        
        .markdown-body a:hover {
          text-decoration: underline;
        }
        
        .markdown-body table {
          border-spacing: 0;
          border-collapse: collapse;
          margin-bottom: 16px;
          width: 100%;
        }
        
        .markdown-body table th, .markdown-body table td {
          padding: 6px 13px;
          border: 1px solid #d0d7de;
        }
        
        .markdown-body table th {
          font-weight: 600;
          background-color: #f6f8fa;
        }
      </style>
    `

    // Return the HTML content and metadata
    return {
      contentHtml: styledContent,
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
