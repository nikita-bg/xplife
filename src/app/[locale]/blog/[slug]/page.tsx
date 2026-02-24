import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
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

function sanitizeBlogContent(html: string): string {
    let content = html

    // Extract only the body content if it's a full HTML document
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
        content = bodyMatch[1]
    }

    // Remove everything before the first real content tag if no body found
    if (!bodyMatch) {
        content = content
            .replace(/<!DOCTYPE[^>]*>/gi, '')
            .replace(/<html[^>]*>/gi, '')
            .replace(/<\/html>/gi, '')
            .replace(/<head>[\s\S]*?<\/head>/gi, '')
            .replace(/<body[^>]*>/gi, '')
            .replace(/<\/body>/gi, '')
    }

    // Remove <style> blocks
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // Strip inline styles from ALL elements
    content = content.replace(/\sstyle="[^"]*"/gi, '')

    // Strip width/height attributes from all elements
    content = content.replace(/\swidth="[^"]*"/gi, '')
    content = content.replace(/\sheight="[^"]*"/gi, '')

    // Add lazy loading and sizing to images
    content = content.replace(
        /<img([^>]*?)>/gi,
        '<img$1 loading="lazy" decoding="async">'
    )

    return content.trim()
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
        <div className="min-h-screen bg-background text-ghost">
            <Navbar />

            <article className="max-w-4xl mx-auto px-6 pt-28 pb-16">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: typedPost.title,
                            description: typedPost.excerpt || typedPost.title,
                            image: typedPost.cover_image_url || 'https://xplife.app/og-image.png',
                            datePublished: typedPost.created_at,
                            dateModified: typedPost.updated_at || typedPost.created_at,
                            author: {
                                '@type': 'Organization',
                                name: 'XPLife Team',
                                url: 'https://xplife.app',
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: 'XPLife',
                                logo: { '@type': 'ImageObject', url: 'https://xplife.app/og-image.png' },
                            },
                            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://xplife.app/${locale}/blog/${slug}` },
                            inLanguage: locale,
                        }),
                    }}
                />

                <Link
                    href={`/${locale}/blog`}
                    className="mb-8 inline-flex items-center gap-2 text-sm text-ghost/50 hover:text-accent transition-colors font-data uppercase tracking-wider"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('backToBlog')}
                </Link>

                <header className="mb-8">
                    <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-ghost uppercase tracking-tight leading-tight">
                        {typedPost.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ghost/40 font-data">
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
                    <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-white/5">
                        <Image
                            src={typedPost.cover_image_url}
                            alt={typedPost.title}
                            fill
                            sizes="(max-width: 896px) 100vw, 896px"
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div
                    className="prose prose-invert prose-lg max-w-none
                        prose-headings:font-heading prose-headings:text-ghost prose-headings:uppercase prose-headings:tracking-tight
                        prose-p:text-ghost/70 prose-p:leading-relaxed prose-p:font-sans
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-ghost
                        prose-img:rounded-xl prose-img:border prose-img:border-white/5
                        prose-blockquote:border-accent prose-blockquote:text-ghost/60
                        prose-code:text-accent prose-code:bg-white/5 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
                        prose-pre:bg-[#0C1021] prose-pre:border prose-pre:border-white/5
                        prose-li:text-ghost/70 prose-li:font-sans
                        prose-hr:border-white/10"
                    dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(typedPost.content) }}
                />

                <div className="mt-12 bg-[#0C1021] rounded-2xl border border-white/5 p-8 text-center">
                    <h2 className="font-heading font-bold text-2xl text-ghost uppercase tracking-tight">
                        {t('ctaTitle')}
                    </h2>
                    <p className="mt-2 text-ghost/50 font-sans">
                        {t('ctaDescription')}
                    </p>
                    <Link
                        href={`/${locale}/login`}
                        className="mt-6 inline-flex bg-accent text-primary font-heading font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-shadow"
                    >
                        {t('ctaButton')}
                    </Link>
                </div>
            </article>

            <Footer />
        </div>
    )
}
