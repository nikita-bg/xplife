import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import GuildClient from './GuildClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('guild', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/guild', locale, noIndex: true });
}

export default function GuildPage() {
    return <GuildClient />;
}
