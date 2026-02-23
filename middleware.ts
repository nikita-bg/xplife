import { type NextRequest, NextResponse } from 'next/server'
import { intlMiddleware } from '@/lib/i18n/middleware'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip i18n for API routes and static files — only run Supabase session refresh
    if (
        pathname.startsWith('/api') ||
        pathname === '/manifest.json' ||
        pathname === '/sw.js' ||
        pathname === '/offline.html' ||
        pathname.startsWith('/.well-known')
    ) {
        return updateSession(request)
    }

    // Handle i18n routing for page routes
    const intlResponse = intlMiddleware(request)

    // If i18n middleware returns a redirect, use it directly
    if (intlResponse.status === 307 || intlResponse.status === 308) {
        return intlResponse
    }

    // Run Supabase auth middleware
    const supabaseResponse = await updateSession(request)

    // If Supabase returns a redirect (e.g. unauthenticated), use it
    if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
        return supabaseResponse
    }

    // CRITICAL: Return intlResponse as the base (it has locale headers that next-intl needs)
    // and merge supabase cookies into it (for auth session)
    supabaseResponse.cookies.getAll().forEach(cookie => {
        intlResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie,
        })
    })

    return intlResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

