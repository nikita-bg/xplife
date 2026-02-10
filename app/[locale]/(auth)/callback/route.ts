import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function sanitizeRedirectPath(path: string, locale: string): string {
  // Must start with exactly one slash and not contain protocol-relative URLs
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return `/${locale}/dashboard`
  }
  return path
}

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = params.locale
  const next = sanitizeRedirectPath(searchParams.get('next') ?? `/${locale}/dashboard`, locale)

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_error`)
}
