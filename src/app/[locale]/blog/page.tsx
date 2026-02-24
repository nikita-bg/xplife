import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { BookOpen, ArrowRight, Calendar } from 'lucide-react'
import type { BlogPost } from '@/lib/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'blog' })
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
    }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations({ locale, namespace: 'blog' })

    const supabase = createClient()
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background text-ghost">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-32">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-data text-accent uppercase tracking-[0.3em] mb-4">
                        <BookOpen className="h-4 w-4" />
                        {t('badge')}
                    </div>
                    <h1 className="font-heading font-black text-4xl md:text-6xl text-ghost uppercase tracking-tight mb-6">
                        {t('title')} <span className="text-accent">{t('titleHighlight')}</span>
                    </h1>
                    <p className="text-ghost/60 font-sans text-lg max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {(!posts || posts.length === 0) ? (
                    <div className="bg-[#0C1021] rounded-2xl border border-white/5 p-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-8 w-8 text-accent" />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-white mb-3">{t('emptyTitle')}</h3>
                        <p className="text-ghost/50 font-sans text-sm max-w-md mx-auto mb-8">{t('emptyDescription')}</p>
                        <a href="/" className="inline-block bg-accent text-primary font-heading font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-shadow">
                            {t('ctaButton')}
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {(posts as BlogPost[]).map((post) => (
                            <Link
                                key={post.id}
                                href={`/${locale}/blog/${post.slug}`}
                                className="group bg-[#0C1021] rounded-2xl overflow-hidden border border-white/5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
                            >
                                {post.cover_image_url && (
                                    <div className="relative aspect-video w-full overflow-hidden">
                                        <Image
                                            src={post.cover_image_url}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    {post.published_at && (
                                        <div className="mb-3 flex items-center gap-1.5 text-xs text-ghost/40 font-data">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(post.published_at).toLocaleDateString(locale, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    )}
                                    <h2 className="font-heading font-bold text-lg text-white transition-colors group-hover:text-accent">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="mt-2 line-clamp-3 text-sm text-ghost/50 font-sans">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-center gap-1 text-sm font-data font-medium text-accent uppercase tracking-wider">
                                        {t('readMore')}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
