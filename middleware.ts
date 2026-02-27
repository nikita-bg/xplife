import { type NextRequest, NextResponse } from 'next/server'
import { intlMiddleware } from '@/lib/i18n/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { trackPageView, shouldTrackAnalytics } from '@/lib/analytics/tracker'
import { auth } from '@/lib/auth/config'

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

    // Analytics tracking (non-blocking, fire-and-forget)
    // Track page views after i18n resolution but before auth checks
    if (shouldTrackAnalytics(pathname)) {
        // Don't await - run in background to avoid blocking request
        trackPageView(request).catch(err => {
            console.error('[Middleware] Analytics tracking error:', err)
        })
    }

    // Run Supabase auth middleware
    const supabaseResponse = await updateSession(request)

    // If Supabase returns a redirect (e.g. unauthenticated), use it
    if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
        return supabaseResponse
    }

    // Admin route protection with NextAuth
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = await auth()
        if (!session || session.user?.role !== 'admin') {
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Redirect logged-in admin users away from login page
    if (pathname.startsWith('/admin/login')) {
        const session = await auth()
        if (session?.user?.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
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

