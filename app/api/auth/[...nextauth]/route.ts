import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/db"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

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

        // Use type assertion to access the properties
        // This is a temporary fix until Prisma client is regenerated
        const typedUser = user as unknown as {
          id: string
          name: string
          email: string
          password: string
          isVerified: boolean
          hasAcceptedTerms: boolean
          subscription?: { plan: string }
        }

        // Compare password
        const passwordMatch = await compare(credentials.password, typedUser.password)

        if (!passwordMatch) {
          return null
        }

        // Return user with explicitly typed properties and include isVerified status
        return {
          id: typedUser.id,
          name: typedUser.name,
          email: typedUser.email,
          hasAcceptedTerms: typedUser.hasAcceptedTerms,
          isVerified: typedUser.isVerified, // Include isVerified status
          subscription: typedUser.subscription,
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
        token.isVerified = user.isVerified // Add isVerified to token
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
        session.user.isVerified = token.isVerified as boolean // Add isVerified to session
        session.user.subscription = token.subscription as { plan: string } | undefined
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
