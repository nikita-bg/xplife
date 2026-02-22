import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'bg', 'es', 'zh', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const validatedLocale = requested && locales.includes(requested as Locale)
        ? requested
        : defaultLocale;

    return {
        locale: validatedLocale,
        messages: (await import(`./messages/${validatedLocale}.json`)).default
    };
});
