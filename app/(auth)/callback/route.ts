import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function sanitizeRedirectPath(path: string): string {
  // Must start with exactly one slash and not contain protocol-relative URLs
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return '/dashboard'
  }
  return path
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeRedirectPath(searchParams.get('next') ?? '/dashboard')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
