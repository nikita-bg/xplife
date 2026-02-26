import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import DashboardClient from './DashboardClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('dashboard', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/dashboard', locale, noIndex: true });
}

export default function DashboardPage() {
    return <DashboardClient />;
}
