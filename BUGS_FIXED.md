# XPLife — Bugs Fixed Report

## 🔴 Critical Bugs

### Bug 1: XP Bar Overflow (5,975 / 1,300 XP)
- **Root cause:** Dashboard used `level_config` table values for XP thresholds. If those values were stale/wrong, `currentXP > maxXP`.
- **Fix:** Created [`lib/xpUtils.ts`](file:///c:/Users/Nikita/Desktop/xplife-app/lib/xpUtils.ts) with formula `xpForLevel(n) = Math.floor(100 * n^1.5)`. All XP/level/rank calculations now use this single source of truth.
- **Files:** `lib/xpUtils.ts` (new), `app/[locale]/(app)/dashboard/page.tsx` (rewritten), `lib/api/xp.ts` (rewritten)

### Bug 2: Multi-Level-Up Not Handled
- **Root cause:** `lib/api/xp.ts` only checked `nextLevel.xp_required` — if XP jumped past multiple levels, only one level-up triggered.
- **Fix:** `getLevelFromTotalXP()` loops to find the correct level. `awardXp()` now calculates `levelsGained` correctly.
- **Files:** `lib/xpUtils.ts`, `lib/api/xp.ts`

### Bug 3: Character XP Bar Used Wrong Value
- **Root cause:** `CharacterCard` used `user.totalXP` (cumulative) instead of `character.currentXP` (within-level progress).
- **Fix:** Changed to `character.currentXP` which is now correctly calculated by `getXPProgress()`.
- **Files:** `components/dashboard/CharacterCard.tsx`

### Bug 4: Level Not Synced to DB
- **Root cause:** If the formula-derived level differed from the stored level (e.g., after XP data was fixed), the DB stayed stale.
- **Fix:** Dashboard page now auto-syncs: `if (profile.level !== derivedLevel) update(level)`.
- **Files:** `app/[locale]/(app)/dashboard/page.tsx`

## 🟡 Medium Bugs

### Bug 5: Streak Reset Logic Duplicated
- **Root cause:** Identical 30-line streak reset code existed in both `dashboard/page.tsx` and `profile/page.tsx`.
- **Fix:** Extracted to [`lib/streakUtils.ts`](file:///c:/Users/Nikita/Desktop/xplife-app/lib/streakUtils.ts). Both pages now call `checkAndResetStreak()`.
- **Files:** `lib/streakUtils.ts` (new), `app/[locale]/(app)/dashboard/page.tsx`, `app/[locale]/(app)/profile/page.tsx`

### Bug 6: Character API In-Memory Storage
- **Status:** Documented — `app/api/character/route.ts` uses `InMemoryCharacterStorage`. Data lost on every Vercel deploy. Needs Supabase migration to add character config columns to `users` table.
- **Workaround:** Dashboard derives character config from `personality_type` and `level`, not from the API.

### Bug 7: Missing `character-idle-float` CSS Keyframe
- **Root cause:** `CharacterSVG.tsx` applied `animation: character-idle-float 3s...` but the keyframe didn't exist in globals.css.
- **Fix:** Added the keyframe to `globals.css`.
- **Files:** `app/globals.css`

## 🟢 Minor Issues

### Bug 8: TypeScript Implicit `any` Errors
- **Status:** All fixed in previous session (all dashboard/UI components now have proper interfaces).

### Bug 9: `dropSystem.ts` `.catch()` Type Error
- **Root cause:** Supabase `.rpc()` return type doesn't have `.catch()` method.
- **Fix:** Wrapped in `try/catch` block.
- **Files:** `lib/cases/dropSystem.ts`
