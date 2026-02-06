import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'XPLife - Level Up Your Life',
  description: 'Turn your goals into epic quests. Earn XP. Track streaks. Become your best self with AI-powered life optimization.',
}

export const viewport: Viewport = {
  themeColor: '#0d0d14',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
