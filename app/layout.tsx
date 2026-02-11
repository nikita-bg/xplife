import React from 'react';
import type { Viewport } from 'next';
import Script from 'next/script';
import { Inter, Orbitron } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  themeColor: '#0d0d14',
};

// Root layout provides html/body structure
// Locale-specific layout in [locale]/layout.tsx provides i18n context
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="iMF7KfylAIJLEsTxYpEIpjUuZ5TkMV5Dji9BDphMOvM" />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </body>
    </html>
  );
}
