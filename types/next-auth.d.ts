import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      /** The user's role. */
      role?: string
      /** Whether the user has verified their email. */
      isVerified?: boolean
      /** Whether the user has accepted the terms of service. */
      hasAcceptedTerms?: boolean
      /** The user's subscription details. */
      subscription?: {
        plan: string
        status: string
        currentPeriodEnd?: string
      }
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: string
    isVerified?: boolean
    hasAcceptedTerms?: boolean
    subscription?: {
      plan: string
      status: string
      currentPeriodEnd?: string
    }
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's id. */
    id: string
    /** The user's role. */
    role?: string
    /** Whether the user has verified their email. */
    isVerified?: boolean
    /** Whether the user has accepted the terms of service. */
    hasAcceptedTerms?: boolean
    /** The user's subscription details. */
    subscription?: {
      plan: string
      status: string
      currentPeriodEnd?: string
    }
  }
}
