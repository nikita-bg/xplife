import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

export default async function MarketPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${locale}/login`)

    // Fetch active market listings
    const { data: listings } = await supabase
        .from('market_listings')
        .select('*, items(*)')
        .eq('status', 'active')
        .order('listed_at', { ascending: false })
        .limit(50)

    // Fetch user wallet
    const { data: wallet } = await supabase
        .from('user_wallet')
        .select('coins, gems')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold sm:text-3xl">
                        <span style={{ color: 'var(--accent-cyan)' }}>MARKETPLACE</span>
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Buy and sell items with other players
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                    <span>🪙</span>
                    <span className="font-display font-bold" style={{ color: 'var(--coin-color)' }}>
                        {(wallet?.coins ?? 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Listings Grid */}
            {listings && listings.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {listings.map((listing) => {
                        const item = listing.items as { name: string; rarity: string; type: string; thumbnail_url: string | null } | null
                        if (!item) return null

                        const rarityColor = {
                            common: 'var(--rarity-common)',
                            uncommon: 'var(--rarity-uncommon)',
                            rare: 'var(--rarity-rare)',
                            epic: 'var(--rarity-epic)',
                            legendary: 'var(--rarity-legendary)',
                            mythic: 'var(--rarity-mythic)',
                        }[item.rarity] ?? 'var(--rarity-common)'

                        return (
                            <div
                                key={listing.id}
                                className="group rounded-xl p-3 transition-all duration-200 hover:scale-[1.03]"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: `1px solid ${rarityColor}33`,
                                }}
                            >
                                <div className="mb-2 flex h-20 w-full items-center justify-center rounded-lg"
                                    style={{ background: `${rarityColor}10` }}>
                                    {item.thumbnail_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.thumbnail_url} alt={item.name} className="h-16 w-16 object-contain" />
                                    ) : (
                                        <div className="text-3xl opacity-50">📦</div>
                                    )}
                                </div>

                                <span className="block text-xs font-medium text-foreground line-clamp-1 mb-1">
                                    {item.name}
                                </span>

                                <span className="block text-[10px] uppercase tracking-wider mb-2"
                                    style={{ color: rarityColor }}>
                                    {item.rarity} • {item.type}
                                </span>

                                <div className="flex items-center justify-between">
                                    <span className="font-display text-sm font-bold" style={{ color: 'var(--coin-color)' }}>
                                        🪙 {listing.price_coins.toLocaleString()}
                                    </span>
                                    <button className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                                        style={{ background: 'var(--accent-cyan)', color: 'var(--bg-base)' }}>
                                        BUY
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl">
                    <div className="text-4xl mb-4">🏪</div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">Market is empty</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Be the first to list an item! Go to your inventory and click &quot;Sell on Market&quot;.
                    </p>
                </div>
            )}
        </div>
    )
}
