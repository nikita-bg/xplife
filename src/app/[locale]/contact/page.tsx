import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import ContactClient from './ContactClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('contact', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/contact', locale });
}

export default function ContactPage() {
    return <ContactClient />;
}
