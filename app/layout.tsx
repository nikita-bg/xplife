import React from 'react';
import type { Viewport } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import { redirect } from 'next/navigation';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const viewport: Viewport = {
  themeColor: '#0d0d14',
};

// Root layout - redirects to default locale
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout should only be hit when accessing the root path without locale
  // Redirect to default locale
  redirect('/en');

  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </body>
    </html>
  );
}
