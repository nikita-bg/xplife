import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['en', 'bg', 'es', 'zh', 'ja']
const defaultLocale = 'en'

function getLocaleFromPathname(pathname: string): string {
    const segments = pathname.split('/')
    const potentialLocale = segments[1]
    if (locales.includes(potentialLocale)) {
        return potentialLocale
    }
    return defaultLocale
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const protectedPaths = ['/dashboard', '/onboarding', '/profile', '/leaderboard', '/tasks', '/braverman', '/inventory', '/market']
    const authPaths = ['/login', '/signup']

    const pathname = request.nextUrl.pathname
    const locale = getLocaleFromPathname(pathname)
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

    // Redirect unauthenticated users from protected paths to login
    if (!user && protectedPaths.some((path) => pathnameWithoutLocale.startsWith(path))) {
        const url = request.nextUrl.clone()
        url.pathname = `/${locale}/login`
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth paths to dashboard
    if (user && authPaths.some((path) => pathnameWithoutLocale.startsWith(path))) {
        const url = request.nextUrl.clone()
        url.pathname = `/${locale}/dashboard`
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
