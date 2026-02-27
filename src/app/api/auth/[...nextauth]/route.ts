/**
 * NextAuth API Route Handler
 *
 * Handles all authentication requests for the admin panel:
 * - POST /api/auth/signin - Login
 * - GET /api/auth/signout - Logout
 * - POST /api/auth/callback/credentials - Credentials callback
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/providers - Get available providers
 * - GET /api/auth/csrf - Get CSRF token
 *
 * NextAuth v5 automatically handles all these routes via the handlers export
 */

import { handlers } from "@/lib/auth/config"

export const { GET, POST } = handlers
