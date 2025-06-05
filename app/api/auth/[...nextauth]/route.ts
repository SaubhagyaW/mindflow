import type {Session, User} from "next-auth"
import NextAuth, {type NextAuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import {compare} from "bcryptjs"
import prisma from "@/lib/db"
import type {JWT} from "next-auth/jwt"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            subscription: true, // Include the subscription relation
          },
        })

        if (!user) {
          return null
        }

        // Compare password
        const passwordMatch = await compare(credentials.password, user.password || user.hashedPassword || "")

        if (!passwordMatch) {
          return null
        }

        // Return user with proper typing
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          hasAcceptedTerms: user.hasAcceptedTerms,
          isVerified: user.isVerified, // Make sure this is included
          subscription: user.subscription
            ? {
                plan: user.subscription.plan,
                status: "active",
                currentPeriodEnd: user.subscription.endDate?.toISOString(),
              }
            : undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: { token: JWT; user?: User | undefined; trigger?: string; session?: any }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.hasAcceptedTerms = user.hasAcceptedTerms
        token.subscription = user.subscription
        token.isVerified = user.isVerified
      }

      // Handle session updates
      if (trigger === "update" && session) {
        if (session.hasAcceptedTerms !== undefined) {
          token.hasAcceptedTerms = session.hasAcceptedTerms
        }
        if (session.subscription !== undefined) {
          token.subscription = session.subscription
        }
        if (session.isVerified !== undefined) {
          token.isVerified = session.isVerified
        }
      }

      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.hasAcceptedTerms = token.hasAcceptedTerms as boolean
        session.user.isVerified = token.isVerified as boolean
        session.user.subscription = token.subscription as { plan: string; status: string; currentPeriodEnd?: string | undefined } | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
