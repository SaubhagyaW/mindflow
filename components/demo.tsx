import Link from "next/link"
import { Play } from "lucide-react"

export default function Demo() {
  return (
    <section id="demo" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">See MindFlow in Action</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Watch how MindFlow can transform your brainstorming sessions
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black/5 shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                <Play className="h-8 w-8" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white">MindFlow Demo: Brainstorming Made Easy</h3>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/services"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1"
            >
              Try It Yourself
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

