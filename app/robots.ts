import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/profile/', '/onboarding/', '/braverman/'],
    },
    sitemap: 'https://xplife.app/sitemap.xml',
  }
}
