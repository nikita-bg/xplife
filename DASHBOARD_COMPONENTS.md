# Dashboard Components — Prop Reference

## DashboardLayout

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `character` | `CharacterConfig` | ✅ | Full character configuration (class, rank, level, parts, colors) |
| `user` | `UserProps` | ✅ | User display data (avatar, username, totalXP, rank, level, streak, dailyCompleted, dailyTotal) |
| `locale` | `string` | — | i18n locale for link hrefs (default: `'en'`) |

---

## Navbar

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user.avatar` | `string \| null` | — | Avatar image URL; falls back to initial letter |
| `user.username` | `string` | — | Display name |
| `user.totalXP` | `number` | — | Shown in Orbitron cyan |
| `user.rank` | `RankTier` | — | Determines avatar border color |
| `user.level` | `number` | — | Reserved (not currently displayed) |
| `activeRoute` | `string` | — | Fallback active route hint if pathname can't be determined |
| `locale` | `string` | — | Locale prefix for link hrefs |

---

## LeftSidebar

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activeQuest` | `'daily' \| 'weekly' \| 'monthly'` | — | Which button appears active (default: `'daily'`) |
| `onQuestChange` | `(key: string) => void` | — | Callback when a button is clicked |

---

## RightSidebar

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onToolSelect` | `(key: string) => void` | — | Callback with `'braverman' \| 'review' \| 'guide'` |

---

## CharacterCard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `character` | `CharacterConfig` | ✅ | Full character config: `{ class, rank, level, currentXP, maxXP, parts, colors }` |
| `user` | `{ totalXP: number }` | ✅ | User XP used for the progress bar |

---

## BottomBar

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streak` | `number` | — | Count-up animation target (default: `0`) |
| `completed` | `number` | — | Completed quests count (default: `0`) |
| `total` | `number` | — | Total quests for dot display (default: `5`) |

---

## GlassButton *(ui/)*

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `LucideIcon` | — | Lucide icon component |
| `label` | `string` | ✅ | Button text (rendered uppercase in Orbitron) |
| `accentSide` | `'left' \| 'right'` | — | Which edge gets the colored accent bar (default: `'left'`) |
| `accentColor` | `'purple' \| 'cyan'` | — | Accent & icon color theme (default: `'purple'`) |
| `onClick` | `() => void` | — | Click handler |
| `isActive` | `boolean` | — | Active visual state (brighter border + bg) |
| `badge` | `number` | — | Optional count badge shown on right end |

---

## GradientBorderCard *(ui/)*

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | ✅ | Card contents |
| `style` | `CSSProperties` | — | Outer wrapper styles (use for width/height) |
| `className` | `string` | — | Extra class names on outer wrapper |

---

## XPProgressBar *(ui/)*

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `current` | `number` | ✅ | Current XP value (animates from 0 on mount) |
| `max` | `number` | ✅ | Max XP for this level |
| `animated` | `boolean` | — | Enable count-up animation (default: `true`) |

---

## LevelBadge *(ui/)*

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `level` | `number` | ✅ | Level number displayed |
| `delay` | `number` | — | Framer Motion entrance animation delay in seconds (default: `0.8`) |

---

## RankBadge *(ui/)*

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `rank` | `RankTier` | ✅ | One of: `iron \| bronze \| silver \| gold \| platinum \| diamond \| master \| grandmaster \| challenger` |

---

## ParticleBackground *(ui/)*

No props. Generates 25 randomized particles on mount. Automatically disabled if `prefers-reduced-motion` is active.
