import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import BravermanClient from './BravermanClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('braverman', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/braverman', locale, noIndex: true });
}

export default function BravermanPage() {
    return <BravermanClient />;
}
