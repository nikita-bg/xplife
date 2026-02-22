import { type NextRequest } from 'next/server'
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

    // If i18n middleware returns a redirect, use it
    if (intlResponse.status === 307 || intlResponse.status === 308) {
        return intlResponse
    }

    // Otherwise, pass the request through Supabase auth middleware
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
