/**
 * Admin Dashboard Page
 *
 * Server component that renders the AdminDashboard client component.
 * Sets metadata and handles initial authentication check.
 */

import { Metadata } from 'next'
import AdminDashboard from './AdminDashboard'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | XPLife Admin',
  description: 'Self-hosted analytics dashboard for XPLife website',
  robots: 'noindex, nofollow',
}

export default function AdminPage() {
  return <AdminDashboard />
}
