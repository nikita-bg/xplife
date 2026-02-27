import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://xplife.app';
  const locales = ['en', 'bg']; // Add more locales as needed

  // Main pages
  const pages = ['', '/features', '/pricing', '/about', '/contact'];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add pages for each locale
  locales.forEach((locale) => {
    pages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    });
  });

  // TODO: Add dynamic blog posts here when blog is implemented
  // Example:
  // blogPosts.forEach((post) => {
  //   locales.forEach((locale) => {
  //     sitemap.push({
  //       url: `${baseUrl}/${locale}/blog/${post.slug}`,
  //       lastModified: post.updatedAt,
  //       changeFrequency: 'monthly',
  //       priority: 0.6,
  //     });
  //   });
  // });

  return sitemap;
}
