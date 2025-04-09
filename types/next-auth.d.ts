import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id */
      id: string
      /** Whether the user has accepted terms */
      hasAcceptedTerms: boolean
      /** The user's subscription */
      subscription?: {
        plan: string
      }
    } & DefaultSession["user"]
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    hasAcceptedTerms: boolean
    isVerified?: boolean
    subscription?: {
      plan: string
    }
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's id */
    id: string
    /** Whether the user has accepted terms */
    hasAcceptedTerms: boolean
    /** The user's subscription */
    subscription?: {
      plan: string
    }
  }
}

