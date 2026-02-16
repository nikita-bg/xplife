import React from 'react';
import type { Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0d0d14',
};

// Root layout is a pass-through; locale layout provides html/body with lang attribute
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
