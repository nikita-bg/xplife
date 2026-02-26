import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import PrivacyClient from './PrivacyClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('privacy', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/privacy', locale });
}

export default function PrivacyPage() {
    return <PrivacyClient />;
}
