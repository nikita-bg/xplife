import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryGrid } from '@/components/inventory/inventory-grid'

export default async function InventoryPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${locale}/login`)

    // Fetch inventory, cases, and wallet in parallel
    const [
        { data: inventory },
        { data: userCases },
        { data: wallet },
    ] = await Promise.all([
        supabase
            .from('user_inventory')
            .select('*, items(*)')
            .eq('user_id', user.id)
            .order('obtained_at', { ascending: false }),
        supabase
            .from('user_cases')
            .select('*, cases(*)')
            .eq('user_id', user.id)
            .order('obtained_at', { ascending: false }),
        supabase
            .from('user_wallet')
            .select('*')
            .eq('user_id', user.id)
            .single(),
    ])

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold sm:text-3xl">
                        <span style={{ color: 'var(--accent-cyan)' }}>INVENTORY</span>
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your items, cases, and equipment
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                        <span>🪙</span>
                        <span className="font-display font-bold" style={{ color: 'var(--coin-color)' }}>
                            {(wallet?.coins ?? 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                        <span>💎</span>
                        <span className="font-display font-bold" style={{ color: 'var(--gem-color)' }}>
                            {wallet?.gems ?? 0}
                        </span>
                    </div>
                </div>
            </div>

            <InventoryGrid
                inventory={inventory ?? []}
                userCases={userCases ?? []}
            />
        </div>
    )
}
