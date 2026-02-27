/**
 * Admin Layout
 *
 * Wraps all /admin/* routes with authentication check.
 * Server component that redirects unauthenticated users to login page.
 *
 * Note: This is a backup check. Primary auth protection happens in middleware.
 */

import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | XPLife',
  description: 'Private analytics dashboard for XPLife administrators',
  robots: 'noindex, nofollow', // Prevent search engine indexing
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check session on server side
  const session = await auth()

  // Redirect to login if not authenticated (backup check, middleware should handle this)
  if (!session && !children.toString().includes('login')) {
    redirect('/admin/login')
  }

  // Render children (either login page or protected admin pages)
  return <>{children}</>
}
