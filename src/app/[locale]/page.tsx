import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import LandingClient from './LandingClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('home', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '', locale });
}

export default function HomePage() {
    return <LandingClient />;
}
