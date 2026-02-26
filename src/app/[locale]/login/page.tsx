import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import LoginClient from './LoginClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('login', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/login', locale });
}

export default function LoginPage() {
    return <LoginClient />;
}
