import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import LeaderboardClient from './LeaderboardClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('leaderboard', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/leaderboard', locale, noIndex: true });
}

export default function LeaderboardPage() {
    return <LeaderboardClient />;
}
