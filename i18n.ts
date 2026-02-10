import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define supported locales
export const locales = ['en', 'bg', 'es', 'zh', 'ja'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validatedLocale = locale || defaultLocale;

  if (!locales.includes(validatedLocale as Locale)) {
    notFound();
  }

  return {
    locale: validatedLocale,
    messages: (await import(`./messages/${validatedLocale}.json`)).default
  };
});
