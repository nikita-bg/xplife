import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n';

export const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
});

export function getLocaleFromPathname(pathname: string): string {
    const segments = pathname.split('/');
    const potentialLocale = segments[1];

    if ((locales as readonly string[]).includes(potentialLocale)) {
        return potentialLocale;
    }

    return defaultLocale;
}
