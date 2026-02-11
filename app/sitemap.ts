import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { locales } from '@/i18n'

const baseUrl = 'https://xplife.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Fetch published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  // Static public pages
  const staticPages = ['', '/about', '/contact', '/privacy', '/terms', '/blog']

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/blog' ? 0.8 : 0.5,
    })),
  )

  // Dynamic blog post entries
  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).flatMap((post) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  )

  return [...staticEntries, ...blogEntries]
}
