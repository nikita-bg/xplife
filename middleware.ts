import { type NextRequest, NextResponse } from 'next/server'
import { intlMiddleware } from '@/lib/i18n/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { trackPageView, shouldTrackAnalytics } from '@/lib/analytics/tracker'

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

    // CRITICAL: Skip i18n entirely for /admin routes — they are not locale-prefixed
    // Without this, intlMiddleware redirects /admin/login → /bg/admin/login causing infinite loop
    if (pathname.startsWith('/admin')) {
        // Check for NextAuth session token cookie
        // NextAuth v5 uses 'authjs.session-token' in dev, '__Secure-authjs.session-token' in prod
        const sessionToken = request.cookies.get('authjs.session-token')?.value
            || request.cookies.get('__Secure-authjs.session-token')?.value

        // Admin route protection — require session token
        if (!pathname.startsWith('/admin/login')) {
            if (!sessionToken) {
                const loginUrl = new URL('/admin/login', request.url)
                loginUrl.searchParams.set('callbackUrl', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        // Redirect already-logged-in admin users away from login page
        if (pathname.startsWith('/admin/login') && sessionToken) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        return NextResponse.next()
    }

    // Handle i18n routing for non-admin page routes
    const intlResponse = intlMiddleware(request)

    // If i18n middleware returns a redirect, use it directly
    if (intlResponse.status === 307 || intlResponse.status === 308) {
        return intlResponse
    }

    // Analytics tracking (non-blocking, fire-and-forget)
    if (shouldTrackAnalytics(pathname)) {
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

