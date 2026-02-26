import type { Metadata } from 'next'
import { locales } from '@/i18n'

const BASE_URL = 'https://xplife.app'

interface PageSEO {
    title: string
    description: string
    path: string
    locale: string
    noIndex?: boolean
}

/**
 * Generate comprehensive metadata for a page with OG tags,
 * Twitter cards, alternateLinks for all locales, and canonical URL.
 */
export function generatePageMetadata({
    title,
    description,
    path,
    locale,
    noIndex = false,
}: PageSEO): Metadata {
    const url = `${BASE_URL}/${locale}${path}`
    const fullTitle = path === '' ? title : `${title} | XPLife`

    // Build alternate language links
    const alternates: Record<string, string> = {}
    for (const loc of locales) {
        alternates[loc] = `${BASE_URL}/${loc}${path}`
    }

    return {
        title: fullTitle,
        description,
        metadataBase: new URL(BASE_URL),
        alternates: {
            canonical: url,
            languages: alternates,
        },
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: 'XPLife',
            type: 'website',
            locale,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'XPLife — Gamify Your Daily Quests',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: ['/og-image.png'],
        },
        robots: noIndex ? { index: false, follow: false } : undefined,
    }
}

/** SEO data per page, per locale */
export const PAGE_SEO: Record<string, Record<string, { title: string; description: string }>> = {
    home: {
        en: { title: 'XPLife — Gamified To-Do List & ADHD Planner | Level Up Your Life', description: 'Transform boring goals into epic RPG quests. Earn XP, track streaks, and become your best self with AI-powered life optimization.' },
        bg: { title: 'XPLife — Геймифицирай живота си | Превърни целите в куестове', description: 'Трансформирай скучните цели в епични RPG куестове. Печели XP, проследявай серии и стани най-добрата си версия.' },
        es: { title: 'XPLife — Lista de Tareas Gamificada | Sube de Nivel Tu Vida', description: 'Transforma metas aburridas en misiones RPG épicas. Gana XP, rastrea rachas y conviértete en tu mejor versión.' },
        zh: { title: 'XPLife — 游戏化待办清单 | 升级你的人生', description: '将无聊的目标变成史诗RPG任务。赚取XP，追踪连胜，用AI驱动的生活优化成就最好的自己。' },
        ja: { title: 'XPLife — ゲーミフィケーション型ToDoリスト | 人生をレベルアップ', description: '退屈な目標をエピックなRPGクエストに変えよう。XPを獲得し、ストリークを追跡し、AI搭載の生活最適化で最高の自分になろう。' },
    },
    dashboard: {
        en: { title: 'Dashboard', description: 'Your quest hub — view active quests, track XP, and level up your character.' },
        bg: { title: 'Табло', description: 'Вашият хъб за куестове — вижте активните куестове, проследявайте XP и повишавайте нивото на героя си.' },
        es: { title: 'Panel', description: 'Tu centro de misiones — ve misiones activas, rastrea XP y sube de nivel tu personaje.' },
        zh: { title: '仪表板', description: '你的任务中心 — 查看活跃任务、追踪XP、提升角色等级。' },
        ja: { title: 'ダッシュボード', description: 'クエストハブ — アクティブなクエストを確認し、XPを追跡し、キャラクターをレベルアップ。' },
    },
    market: {
        en: { title: 'Market', description: 'Browse and buy equipment for your avatar with gold earned from quests.' },
        bg: { title: 'Пазар', description: 'Разглеждайте и купувайте екипировка за аватара си със злато, спечелено от куестове.' },
        es: { title: 'Mercado', description: 'Explora y compra equipo para tu avatar con el oro ganado en misiones.' },
        zh: { title: '市场', description: '用任务赚取的金币浏览和购买角色装备。' },
        ja: { title: 'マーケット', description: 'クエストで獲得したゴールドでアバターの装備を閲覧・購入しよう。' },
    },
    inventory: {
        en: { title: 'Inventory', description: 'Manage your items and equip gear to customize your avatar.' },
        bg: { title: 'Инвентар', description: 'Управлявайте предметите си и екипирайте снаряжение, за да персонализирате аватара си.' },
        es: { title: 'Inventario', description: 'Gestiona tus objetos y equipa equipo para personalizar tu avatar.' },
        zh: { title: '背包', description: '管理你的物品并装备道具来自定义你的角色。' },
        ja: { title: 'インベントリ', description: 'アイテムを管理し、ギアを装備してアバターをカスタマイズ。' },
    },
    leaderboard: {
        en: { title: 'Leaderboard', description: 'See where you rank among other XPLife players worldwide.' },
        bg: { title: 'Класация', description: 'Вижте къде се нареждате сред другите XPLife играчи по света.' },
        es: { title: 'Clasificación', description: 'Mira dónde te ubicas entre otros jugadores de XPLife en todo el mundo.' },
        zh: { title: '排行榜', description: '查看你在全球XPLife玩家中的排名。' },
        ja: { title: 'リーダーボード', description: '世界中のXPLifeプレイヤーの中での順位を確認しよう。' },
    },
    profile: {
        en: { title: 'Profile', description: 'View and edit your XPLife profile, stats, and preferences.' },
        bg: { title: 'Профил', description: 'Преглед и редактиране на вашия XPLife профил, статистики и предпочитания.' },
        es: { title: 'Perfil', description: 'Ve y edita tu perfil, estadísticas y preferencias de XPLife.' },
        zh: { title: '个人资料', description: '查看和编辑你的XPLife个人资料、统计数据和偏好设置。' },
        ja: { title: 'プロフィール', description: 'XPLifeのプロフィール、統計、設定を表示・編集。' },
    },
    braverman: {
        en: { title: 'Braverman Assessment', description: 'Discover your neurotransmitter profile with our 140-question personality assessment.' },
        bg: { title: 'Braverman Тест', description: 'Открийте невротрансмитерния си профил с нашия тест от 140 въпроса.' },
        es: { title: 'Evaluación Braverman', description: 'Descubre tu perfil de neurotransmisores con nuestra evaluación de personalidad de 140 preguntas.' },
        zh: { title: 'Braverman评估', description: '通过我们的140题人格评估发现你的神经递质特征。' },
        ja: { title: 'ブレイバーマン評価', description: '140問の性格評価で神経伝達物質のプロフィールを発見しよう。' },
    },
    guild: {
        en: { title: 'Guild', description: 'Join or create guilds — team up with other players for group challenges.' },
        bg: { title: 'Гилдия', description: 'Присъединете се или създайте гилдия — обединете се с други играчи за групови предизвикателства.' },
        es: { title: 'Gremio', description: 'Únete o crea gremios — forma equipo con otros jugadores para desafíos grupales.' },
        zh: { title: '公会', description: '加入或创建公会 — 与其他玩家组队完成团队挑战。' },
        ja: { title: 'ギルド', description: 'ギルドに参加・作成 — 他のプレイヤーとチームを組んでグループチャレンジに挑戦。' },
    },
    boss: {
        en: { title: 'Boss Battle', description: 'Fight bosses together — complete quests to deal damage and earn bonus rewards.' },
        bg: { title: 'Бос Битка', description: 'Бийте босове заедно — завършвайте куестове за нанасяне на щети и бонус награди.' },
        es: { title: 'Batalla de Jefe', description: 'Lucha contra jefes juntos — completa misiones para infligir daño y ganar recompensas bonus.' },
        zh: { title: 'Boss战斗', description: '一起打Boss — 完成任务造成伤害并获得额外奖励。' },
        ja: { title: 'ボスバトル', description: 'ボスと一緒に戦おう — クエストを完了してダメージを与え、ボーナス報酬を獲得。' },
    },
    journal: {
        en: { title: 'Journal', description: 'Reflect on your journey — write entries, track progress, and build self-awareness.' },
        bg: { title: 'Дневник', description: 'Размишлявайте над пътуването си — пишете записи, проследявайте напредъка и изграждайте самосъзнание.' },
        es: { title: 'Diario', description: 'Reflexiona sobre tu viaje — escribe entradas, rastrea progreso y desarrolla autoconciencia.' },
        zh: { title: '日记', description: '反思你的旅程 — 写日记、追踪进度、建立自我认知。' },
        ja: { title: 'ジャーナル', description: '旅を振り返ろう — エントリーを書き、進捗を追跡し、自己認識を高めよう。' },
    },
    about: {
        en: { title: 'About', description: 'Learn about XPLife — our mission to make self-improvement fun through gamification.' },
        bg: { title: 'За нас', description: 'Научете за XPLife — нашата мисия да направим самоусъвършенстването забавно чрез геймификация.' },
        es: { title: 'Acerca de', description: 'Conoce XPLife — nuestra misión de hacer la superación personal divertida a través de la gamificación.' },
        zh: { title: '关于', description: '了解XPLife — 我们通过游戏化让自我提升变得有趣的使命。' },
        ja: { title: 'について', description: 'XPLifeについて — ゲーミフィケーションで自己改善を楽しくする私たちのミッション。' },
    },
    blog: {
        en: { title: 'Blog', description: 'Tips, guides, and insights on gamification, productivity, and personal growth.' },
        bg: { title: 'Блог', description: 'Съвети, ръководства и прозрения за геймификация, продуктивност и личностно развитие.' },
        es: { title: 'Blog', description: 'Consejos, guías e insights sobre gamificación, productividad y crecimiento personal.' },
        zh: { title: '博客', description: '关于游戏化、生产力和个人成长的技巧、指南和见解。' },
        ja: { title: 'ブログ', description: 'ゲーミフィケーション、生産性、個人の成長に関するヒント、ガイド、インサイト。' },
    },
    contact: {
        en: { title: 'Contact', description: 'Get in touch with the XPLife team — feedback, support, and partnership inquiries.' },
        bg: { title: 'Контакти', description: 'Свържете се с екипа на XPLife — обратна връзка, поддръжка и запитвания за партньорства.' },
        es: { title: 'Contacto', description: 'Ponte en contacto con el equipo de XPLife — comentarios, soporte y consultas de asociación.' },
        zh: { title: '联系我们', description: '联系XPLife团队 — 反馈、支持和合作咨询。' },
        ja: { title: 'お問い合わせ', description: 'XPLifeチームに連絡 — フィードバック、サポート、パートナーシップのお問い合わせ。' },
    },
    login: {
        en: { title: 'Login', description: 'Sign in to your XPLife account to continue your adventure.' },
        bg: { title: 'Вход', description: 'Влезте в акаунта си в XPLife, за да продължите приключението си.' },
        es: { title: 'Iniciar Sesión', description: 'Inicia sesión en tu cuenta de XPLife para continuar tu aventura.' },
        zh: { title: '登录', description: '登录你的XPLife账户，继续你的冒险。' },
        ja: { title: 'ログイン', description: 'XPLifeアカウントにサインインして冒険を続けよう。' },
    },
    privacy: {
        en: { title: 'Privacy Policy', description: 'XPLife privacy policy — how we collect, use, and protect your data.' },
        bg: { title: 'Политика за поверителност', description: 'Политика за поверителност на XPLife — как събираме, използваме и защитаваме данните ви.' },
        es: { title: 'Política de Privacidad', description: 'Política de privacidad de XPLife — cómo recopilamos, usamos y protegemos tus datos.' },
        zh: { title: '隐私政策', description: 'XPLife隐私政策 — 我们如何收集、使用和保护你的数据。' },
        ja: { title: 'プライバシーポリシー', description: 'XPLifeプライバシーポリシー — データの収集、使用、保護方法。' },
    },
    terms: {
        en: { title: 'Terms of Service', description: 'XPLife terms of service — rules and guidelines for using our platform.' },
        bg: { title: 'Условия за ползване', description: 'Условия за ползване на XPLife — правила и насоки за използване на платформата.' },
        es: { title: 'Términos de Servicio', description: 'Términos de servicio de XPLife — reglas y directrices para usar nuestra plataforma.' },
        zh: { title: '服务条款', description: 'XPLife服务条款 — 使用我们平台的规则和指南。' },
        ja: { title: '利用規約', description: 'XPLife利用規約 — プラットフォーム使用のルールとガイドライン。' },
    },
}

/** Helper to get SEO for a page + locale with fallback to English */
export function getPageSEO(page: string, locale: string) {
    const pageSeo = PAGE_SEO[page]
    if (!pageSeo) return { title: 'XPLife', description: 'Gamify your life' }
    return pageSeo[locale] || pageSeo.en
}
