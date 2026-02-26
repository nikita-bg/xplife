import type { Metadata } from 'next';
import { generatePageMetadata, getPageSEO } from '@/lib/seo';
import InventoryClient from './InventoryClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const seo = getPageSEO('inventory', locale);
    return generatePageMetadata({ title: seo.title, description: seo.description, path: '/inventory', locale, noIndex: true });
}

export default function InventoryPage() {
    return <InventoryClient />;
}
