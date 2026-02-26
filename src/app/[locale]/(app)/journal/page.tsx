import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import JournalClient from './JournalClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('journal', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/journal', locale, noIndex: true });
}

export default function JournalPage() {
    return <JournalClient />;
}
