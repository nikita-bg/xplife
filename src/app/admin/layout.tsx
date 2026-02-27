/**
 * Admin Layout
 *
 * Wraps all /admin/* routes with proper HTML structure and SessionProvider.
 * Since admin routes skip the [locale] layout (no i18n prefix),
 * this layout provides <html> and <body> tags.
 *
 * Auth protection is handled entirely by middleware.ts
 */

import { Metadata } from 'next'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import AdminProviders from './providers'
import '../globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Admin Dashboard | XPLife',
  description: 'Private analytics dashboard for XPLife administrators',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} font-sans`}>
        <AdminProviders>
          {children}
        </AdminProviders>
      </body>
    </html>
  )
}
