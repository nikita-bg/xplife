import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import TermsClient from './TermsClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('terms', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/terms', locale });
}

export default function TermsPage() {
    return <TermsClient />;
}
