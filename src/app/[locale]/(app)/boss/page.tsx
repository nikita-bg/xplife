import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import BossClient from './BossClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('boss', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/boss', locale, noIndex: true });
}

export default function BossPage() {
    return <BossClient />;
}
