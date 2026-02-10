import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n';

// Create the next-intl middleware
export const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always use locale prefix in URL
});

// Helper to check if a path should be handled by i18n middleware
export function shouldHandleLocale(pathname: string): boolean {
  // Skip API routes, static files, and Next.js internals
  const skipPaths = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
  ];

  // Check if path starts with any skip path
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return false;
  }

  // Skip static file extensions
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|woff2?)$/i.test(pathname)) {
    return false;
  }

  return true;
}

// Helper to extract locale from pathname
export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as any)) {
    return potentialLocale;
  }

  return defaultLocale;
}
