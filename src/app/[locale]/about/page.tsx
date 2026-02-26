import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import AboutClient from './AboutClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('about', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/about', locale });
}

export default function AboutPage() {
    return <AboutClient />;
}
