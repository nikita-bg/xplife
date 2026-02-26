import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import MarketClient from './MarketClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('market', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/market', locale, noIndex: true });
}

export default function MarketPage() {
    return <MarketClient />;
}
