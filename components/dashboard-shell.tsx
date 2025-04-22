import type React from "react"
import { UserNav } from "@/components/user-nav"
import { MainNav } from "@/components/main-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-8 pt-6 bg-gray-50">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}
