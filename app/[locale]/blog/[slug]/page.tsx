import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import type { BlogPost } from '@/lib/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: 'Post Not Found' }

  return {
    title: `${post.title} | XPLife Blog`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'blog' })

  const supabase = createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const typedPost = post as BlogPost
  const readTime = estimateReadTime(typedPost.content)

  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />

      <article className="mx-auto max-w-4xl px-4 pt-28 pb-16">
        <Link
          href={`/${locale}/blog`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToBlog')}
        </Link>

        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl leading-tight">
            {typedPost.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {typedPost.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(typedPost.published_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t('readTime', { minutes: readTime })}
            </div>
          </div>
        </header>

        {typedPost.cover_image_url && (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-border/50">
            <Image
              src={typedPost.cover_image_url}
              alt={typedPost.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-display prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-img:rounded-xl prose-img:border prose-img:border-border/50
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground
            prose-code:text-accent prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
            prose-pre:bg-muted prose-pre:border prose-pre:border-border/50
            prose-li:text-muted-foreground
            prose-hr:border-border/50"
          dangerouslySetInnerHTML={{ __html: typedPost.content }}
        />

        <div className="mt-12 glass-card gradient-border rounded-2xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {t('ctaTitle')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('ctaDescription')}
          </p>
          <Link
            href={`/${locale}/signup`}
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  )
}
