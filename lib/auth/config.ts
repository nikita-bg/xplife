import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Hardcoded admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@xplife.app"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""

if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️  Warning: ADMIN_PASSWORD not set in environment variables")
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("⚠️  Warning: NEXTAUTH_SECRET not set in environment variables")
}

/**
 * NextAuth v5 Configuration for XPLife Admin Panel
 *
 * Features:
 * - Single admin user authentication
 * - Credentials provider with hardcoded email/password
 * - JWT session with 24-hour expiry
 * - Custom login page at /admin/login
 * - Role-based authorization (admin only)
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@xplife.app"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        // Validate credentials format
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Simple string comparison for hardcoded admin credentials
        // Note: In production, consider using bcrypt for hashed passwords
        const isValidEmail = credentials.email === ADMIN_EMAIL
        const isValidPassword = credentials.password === ADMIN_PASSWORD

        if (isValidEmail && isValidPassword) {
          // Return user object for successful authentication
          return {
            id: "admin-user",
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "admin"
          }
        }

        // Invalid credentials
        return null
      }
    })
  ],

  pages: {
    signIn: "/admin/login", // Custom login page
    error: "/admin/login",   // Error page redirects to login
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },

  callbacks: {
    /**
     * JWT Callback
     * Executed when JWT is created or updated
     * Adds role to the token for authorization checks
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin"
        token.userId = user.id
      }
      return token
    },

    /**
     * Session Callback
     * Executed when session is accessed
     * Exposes role in session object for client/server components
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.userId as string
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
}

/**
 * Export NextAuth instance with configuration
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)

/**
 * Type augmentation for NextAuth
 * Adds custom properties to User and Session types
 */
declare module "next-auth" {
  interface User {
    role?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    userId?: string
  }
}
