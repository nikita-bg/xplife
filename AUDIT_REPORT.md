# XPLife Application — Full Codebase Audit Report

> Generated: 2026-02-21 | Pre-overhaul state analysis

---

## 1. Project Overview

| Stack | Detail |
|-------|--------|
| Framework | Next.js 14.2.21 (App Router) |
| Auth | Supabase Auth (email + social via callback route) |
| Database | Supabase (Postgres) |
| i18n | `next-intl` with `localePrefix: 'always'` — 5 locales: en, bg, es, zh, ja |
| Styling | Tailwind CSS + CSS custom properties in `globals.css` |
| Fonts | Inter (body), Orbitron (display) |
| Animations | `framer-motion` (newly added), CSS keyframes |
| Deploy | Vercel |
| Package Manager | npm |

---

## 2. Routes & Pages

### 2.1 App Routes (`/app/[locale]/`)

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` (page.tsx) | Public | No | Landing page (Hero, Features, HowItWorks, Pricing, SocialProof, FinalCTA, Footer) |
| `/(app)/dashboard` | Protected | Yes | Dashboard — recently overhauled to full-screen gamified layout |
| `/(app)/leaderboard` | Protected | Yes | Fetches from `leaderboard` table, sorted by total_xp DESC |
| `/(app)/profile` | Protected | Yes | Profile header + stats + balance + settings form |
| `/(app)/braverman` | Protected | Yes | Braverman personality test |
| `/(app)/tasks/[id]` | Protected | Yes | Individual task detail page |
| `/(auth)/login` | Public | No | Login form |
| `/(auth)/signup` | Public | No | Signup form |
| `/(auth)/callback` | Public | No | OAuth callback — exchanges code for session |
| `/(onboarding)/onboarding` | Protected | Yes | Multi-step onboarding flow |
| `/about` | Public | No | About page |
| `/blog` | Public | No | Blog listing |
| `/blog/[slug]` | Public | No | Individual blog post |
| `/contact` | Public | No | Contact page |
| `/privacy` | Public | No | Privacy policy |
| `/terms` | Public | No | Terms of service |
| `/delete-account` | Public | No | Account deletion page |
| `/character-demo` | Public | No | Character SVG demo viewer |

### 2.2 API Routes (`/app/api/`)

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/character` | GET, POST | Character config CRUD — **⚠️ IN-MEMORY STORAGE** |
| `/api/ai/chat` | POST | AI chat (chat widget) |
| `/api/ai/generate-tasks` | POST | AI quest generation (cascading) |
| `/api/tasks/[id]/feedback` | POST | Task feedback/completion |
| `/api/braverman/submit` | POST | Braverman test results submission |
| `/api/balance/currency` | GET | Currency balance fetch |
| `/api/balance/update` | POST | Balance update |
| `/api/blog/create` | POST | Create blog post |
| `/api/blog/upload-image` | POST | Upload blog image |
| `/api/account/delete` | DELETE | Account deletion |
| `/api/debug/test-n8n` | GET | Debug: n8n webhook test |
| `/api/debug/user-profile` | GET | Debug: user profile dump |
| `/api/webhooks/lemonsqueezy` | POST | Lemon Squeezy payment webhook |

---

## 3. Database Schema

### 3.1 Tables (from `lib/types/database.ts`)

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, email, display_name, avatar_url, total_xp, level, personality_type, gold_balance, plan, about_me, neurotransmitter scores | **No `rank`, `character_class`, or `character_parts` columns** |
| `tasks` | id, user_id, title, category, difficulty, xp_reward, status, quest_timeframe, parent_quest_id | Supports yearly/monthly/weekly/daily cascading |
| `streaks` | user_id, current_streak, longest_streak, last_activity_date | Streak reset logic in dashboard + profile pages |
| `xp_logs` | user_id, amount, source, task_id | XP earning history |
| `level_config` | level, title, xp_required | **XP thresholds — values unknown, likely source of XP bar bug** |
| `leaderboard` | user_id, total_xp, level, rank (numeric position), display_name | `rank` is leaderboard position (number), NOT tier name |
| `braverman_results` | user_id, dopamine/acetylcholine/gaba/serotonin scores, dominant_type | |
| `goals` | user_id, title, category | |
| `blog_posts` | title, slug, content, status | |
| `ai_chat_history` | user_id, role, content | |
| `task_proofs` | task_id, user_id, file_url | |

### 3.2 Missing Tables (needed for Phases 3-4)
- `items` — Item catalog
- `user_inventory` — User's owned items
- `cases` — Case definitions
- `user_cases` — User's owned cases
- `case_openings` — Opening history
- `user_wallet` — Coins/gems
- `coin_transactions` — Transaction log
- `market_listings` — Marketplace

---

## 4. Component Catalog

### 4.1 Character System (`/components/character/`)
- `CharacterConfig.ts` — Types: ClassType (4), RankTier (9), PartType, CharacterPart
- `CharacterSVG.tsx` — Renders assembled SVG via `dangerouslySetInnerHTML`
- `CharacterViewer.tsx` — Interactive viewer component
- `useCharacterTracking.ts` — Mouse-tracking hook for eye pupils

### 4.2 Dashboard (NEW — `/components/dashboard/`)
- `DashboardLayout.tsx` — Full-screen fixed overlay orchestrator
- `Navbar.tsx` — Top nav with logo, links, avatar, XP display
- `CharacterCard.tsx` — Center card with character, level badge, rank, XP bar
- `LeftSidebar.tsx` — Quest type buttons (daily/weekly/monthly)
- `RightSidebar.tsx` — Tool buttons (braverman/review/guide)
- `BottomBar.tsx` — Streak counter, progress dots, CTA button

### 4.3 Dashboard (OLD — still in codebase)
- `xp-bar.tsx` — Old XP progress bar (uses classes, not new design)
- `level-display.tsx` — Old level display
- `streak-counter.tsx` — Old streak display
- `quests-view.tsx` — Tabbed quests view with auto-generation
- `quest-section.tsx`, `task-card.tsx` — Quest rendering
- `generate-quest-dialog.tsx` — Manual quest generation dialog
- `gold-balance.tsx`, `quest-progress.tsx`, `quest-timer.tsx`
- `braverman-banner.tsx`, `onboarding-banner.tsx`, `daily-tasks.tsx`

### 4.4 UI Components (`/components/ui/`)
- NEW: `GlassButton.tsx`, `GradientBorderCard.tsx`, `RankBadge.tsx`, `XPProgressBar.tsx`, `LevelBadge.tsx`, `ParticleBackground.tsx`
- EXISTING: Standard shadcn/ui components (tabs, button, dialog, etc.)

### 4.5 Landing (`/components/landing/`)
- `navbar.tsx`, `hero.tsx`, `features.tsx`, `how-it-works.tsx`
- `pricing.tsx`, `social-proof.tsx`, `final-cta.tsx`, `footer.tsx`

### 4.6 Other
- `/components/leaderboard/` — `leaderboard-table.tsx`, `rank-badge.tsx`
- `/components/profile/` — Multiple profile components (header, settings, stats, balance, avatar crop)
- `/components/onboarding/` — 7 onboarding step components
- `/components/auth/` — Login, signup, social login buttons
- `/components/chat/` — `chat-widget.tsx` (AI chat sidebar)
- `/components/braverman/` — Test + results components

---

## 5. State Management & Data Flow

- **No global state store** (no Zustand, Redux, or Context)
- Data fetching: **Server Components** fetch directly from Supabase in page files
- Client mutations: Direct `fetch()` calls to API routes
- Quest auto-generation: Client-side `useEffect` in `quests-view.tsx` detects empty timeframes and POSTs to `/api/ai/generate-tasks`
- XP award: `lib/api/xp.ts` — client-side Supabase calls (not through API route)

---

## 6. i18n Setup

- `next-intl` with `localePrefix: 'always'`
- Supported locales: `en`, `bg`, `es`, `zh`, `ja`
- Messages: `/messages/{locale}.json`
- Middleware: `intlMiddleware` runs for all non-API routes
- All routes under `/app/[locale]/`
- Translation keys used in components via `useTranslations()` hook

---

## 7. Auth System

- **Supabase Auth** (email/password + social OAuth)
- Middleware chain: `intlMiddleware` → `updateSession` (refreshes Supabase cookie)
- Protected routes redirect to `/{locale}/login` from server components
- OAuth callback at `/{locale}/callback` exchanges code for session
- No custom JWT or token management

---

## 8. Bugs Identified

### 🔴 Bug 1: XP Bar Shows currentXP > maxXP (CRITICAL)
**Screenshot:** XP bar displays `5,975 / 1,300 XP`
**Root cause:** The `level_config` table stores cumulative `xp_required` thresholds. The dashboard page calculates:
```typescript
currentXP = total_xp - xpForCurrentLevel
maxXP = xpForNextLevel - xpForCurrentLevel
```
If `level_config` values are too low compared to actual accumulated XP, `currentXP` exceeds `maxXP`. The level-up check only triggers when `total_xp >= nextLevel.xp_required`, but if the user gained large XP in one action (or the thresholds were changed), they may skip levels.
**Fix:** Implement proper `xpForLevel(level) = Math.floor(100 * level^1.5)` formula; re-derive levels from total_xp; add multi-level-up logic.

### 🔴 Bug 2: Character Avatar Rendering
**Screenshot:** Character is a small gray abstract shape
**Root cause:** The `CharacterCard` in the new dashboard passes `character` prop to `CharacterSVG`, but the config colors may not be reaching the assembler correctly. The `partsSystem.ts` isometric builder is well-implemented — the bug is likely in how `CharacterCard` passes colors to `assembleCharacter`.
**Fix:** Verify color propagation from dashboard page → DashboardLayout → CharacterCard → CharacterSVG → assembleCharacter.

### 🟡 Bug 3: Character API Uses In-Memory Storage
**Location:** `/app/api/character/route.ts`
**Issue:** `InMemoryCharacterStorage` loses all data on every Vercel deploy/restart
**Fix:** Replace with Supabase-backed storage

### 🟡 Bug 4: Missing DB Columns for Character State
**Issue:** `users` table has no `rank`, `character_class`, or `character_parts` columns
**Current workaround:** Dashboard derives rank from level, class from personality_type
**Fix:** Add proper columns or keep derivation but make it consistent everywhere

### 🟡 Bug 5: Streak Reset Logic Duplicated
**Issue:** Identical streak reset code exists in both `dashboard/page.tsx` AND `profile/page.tsx`
**Fix:** Extract to shared utility or Supabase function

### 🟡 Bug 6: XP Award Function Uses Client Supabase
**Location:** `lib/api/xp.ts` uses `createClient()` (browser client) instead of server client
**Issue:** Can only work when called from client component context; no server-side security
**Fix:** Create server-side API route for XP awards

### 🟢 Bug 7: Old Dashboard Components Still in Codebase
**Issue:** `xp-bar.tsx`, `level-display.tsx`, `streak-counter.tsx` etc. are orphaned
**Fix:** Clean up after confirming new dashboard is complete

---

## 9. Architecture Notes

- The codebase is well-structured with clear separation between concerns
- The isometric character system (`partsSystem.ts`) is sophisticated and correct
- Quest cascading (yearly→daily) with AI generation is unique and works
- The landing page exists and has full sections — needs design overhaul, not creation
- Profile page has extensive personalization (time prefs, occupation, life phase, interests)
- Lemon Squeezy webhook integration exists for payments
- Plan limits system exists (`lib/plan-limits.ts`)
