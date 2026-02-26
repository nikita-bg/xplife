import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import ProfileClient from './ProfileClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('profile', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/profile', locale, noIndex: true });
}

export default function ProfilePage() {
    return <ProfileClient />;
}
