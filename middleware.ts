import { type NextRequest } from 'next/server'
import { intlMiddleware } from '@/lib/i18n/middleware'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // First, handle i18n routing
  const intlResponse = intlMiddleware(request)

  // If i18n middleware returns a redirect, use it
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // Otherwise, pass the request through Supabase auth middleware
  // with i18n headers preserved
  const supabaseResponse = await updateSession(request)

  // Merge headers from both middlewares
  intlResponse.headers.forEach((value, key) => {
    if (!supabaseResponse.headers.has(key)) {
      supabaseResponse.headers.set(key, value)
    }
  })

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
