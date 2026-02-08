# XPLife Personalization - Deployment Checklist

## Pre-Deployment Steps

### 1. Database Migration ⚠️ CRITICAL

**Run this in Supabase SQL Editor FIRST:**

```bash
# Copy and paste the contents of:
supabase-personalization-migration.sql
```

**Verify migration success:**
```sql
-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('time_preference', 'preferred_task_duration', 'occupation_type', 'main_challenge');

-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('task_feedback', 'user_interests');
```

Expected output:
- 4 new columns on users table
- 2 new tables created
- All RLS policies active

### 2. Code Build Verification ✅

```bash
cd xplife-app
npm run build
```

**Status:** ✅ Build successful (verified 2026-02-08)

### 3. Environment Variables Check

Ensure these are set in Vercel:
- `N8N_WEBHOOK_URL` ✅
- `N8N_WEBHOOK_SECRET` ✅
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

---

## Deployment

### Option A: Deploy via Git (Recommended)

```bash
git add .
git commit -m "feat: implement comprehensive task personalization system

- Add category success rate analytics (automatic)
- Add time preferences & energy patterns onboarding
- Add occupation & lifestyle context collection
- Add post-completion task feedback modal
- Add interests/hobbies selection
- Update N8N payload with all personalization data

Closes #personalization-phase-1"
git push origin main
```

Vercel will auto-deploy.

### Option B: Manual Deploy

```bash
vercel --prod
```

---

## Post-Deployment Testing

### Test 1: Database Schema ✓

```sql
-- Verify tables exist and have correct structure
\d users
\d task_feedback
\d user_interests
```

### Test 2: New User Onboarding Flow ✓

1. **Create test account:**
   - Go to `/signup`
   - Create account with test email
   - Should redirect to `/onboarding`

2. **Complete all 6 steps:**
   - Step 1: Welcome (click Continue)
   - Step 2: Personality Quiz (answer all questions)
   - Step 3: Time Preferences (select morning + quick tasks)
   - Step 4: Lifestyle (select occupation + challenge)
   - Step 5: Interests (optional - can skip or select)
   - Step 6: Goals (set 1 goal)

3. **Verify data saved:**
   ```sql
   SELECT
     time_preference,
     preferred_task_duration,
     occupation_type,
     main_challenge,
     onboarding_completed
   FROM users
   WHERE email = 'test@example.com';

   SELECT * FROM user_interests
   WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
   ```

### Test 3: Task Generation with Personalization ✓

1. **Generate tasks:**
   - Go to `/dashboard`
   - Click "Generate Daily Quests"
   - Wait for generation

2. **Check Vercel logs:**
   - Go to Vercel dashboard → Logs
   - Filter by `/api/ai/generate-tasks`
   - Look for:
     ```
     [TASK-GEN ...] Calculating category analytics...
     [TASK-GEN ...] Category analytics: { best: null, struggling: null, totalCategories: 0 }
     [TASK-GEN ...] Loaded 0 interests, 0 feedback entries
     ```
   - Should see all new fields in logs

3. **Check N8N execution:**
   - Go to N8N dashboard
   - Check latest execution
   - Verify payload includes:
     - `categoryStats`
     - `timePreference`
     - `occupation`
     - `mainChallenge`
     - `interests`

### Test 4: Task Completion + Feedback ✓

1. **Complete a task:**
   - Go to task detail page
   - Click "Complete Quest"
   - Confirm completion

2. **XP animation should play**

3. **Feedback modal should appear:**
   - Rate difficulty (1-5 stars)
   - Rate enjoyment (1-5 stars)
   - Optionally add time taken
   - Optionally add notes
   - Click "Submit" or "Skip"

4. **Verify feedback saved:**
   ```sql
   SELECT
     tf.*,
     t.title as task_title,
     t.category
   FROM task_feedback tf
   JOIN tasks t ON tf.task_id = t.id
   WHERE tf.user_id = (SELECT id FROM users WHERE email = 'test@example.com');
   ```

### Test 5: Analytics After Multiple Completions ✓

1. **Complete 5+ tasks** across different categories
2. **Add feedback** for each (at least difficulty + enjoyment)
3. **Generate new tasks**
4. **Check logs** for:
   ```
   categoryStats: {
     fitness: { completion_rate: 0.8, total_completed: 4, total_tasks: 5 }
   }
   categoryPreferences: {
     fitness: { avgEnjoyment: 4.5, avgDifficulty: 3.2, count: 4 }
   }
   bestCategory: "fitness"
   strugglingCategory: "learning"
   ```

---

## Expected Behavior

### For NEW Users:
- Must complete all 6 onboarding steps
- All personalization fields collected
- First task generation includes personalization data

### For EXISTING Users:
- Onboarding already completed
- New fields will be `NULL`
- Task generation still works (gracefully handles missing data)
- Can update preferences in profile settings (TODO: build this)

### Graceful Degradation:
- If user skips interests → `interests: []`
- If user has no completed tasks → `categoryStats: {}`
- If user has no feedback → `recentFeedback: []`
- All code handles `null` values safely

---

## Rollback Plan

If something breaks:

### Quick Rollback (Code Only):
```bash
git revert HEAD
git push origin main
```

### Full Rollback (Code + Database):

1. **Revert code deployment** (above)

2. **Drop new tables** (if needed):
   ```sql
   DROP TABLE IF EXISTS task_feedback CASCADE;
   DROP TABLE IF EXISTS user_interests CASCADE;
   ```

3. **Remove new columns** (if needed):
   ```sql
   ALTER TABLE users
     DROP COLUMN IF EXISTS time_preference,
     DROP COLUMN IF EXISTS preferred_task_duration,
     DROP COLUMN IF EXISTS occupation_type,
     DROP COLUMN IF EXISTS work_schedule,
     DROP COLUMN IF EXISTS life_phase,
     DROP COLUMN IF EXISTS main_challenge,
     DROP COLUMN IF EXISTS best_focus_times;
   ```

**Note:** Dropping columns will lose data. Only do this if absolutely necessary.

---

## Monitoring

### Key Metrics to Watch:

1. **Onboarding completion rate:**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE onboarding_completed = true) as completed,
     COUNT(*) as total,
     ROUND(100.0 * COUNT(*) FILTER (WHERE onboarding_completed = true) / COUNT(*), 2) as completion_rate
   FROM users
   WHERE created_at >= NOW() - INTERVAL '7 days';
   ```

2. **Feedback submission rate:**
   ```sql
   SELECT
     COUNT(DISTINCT tf.task_id) as tasks_with_feedback,
     COUNT(DISTINCT t.id) as total_completed_tasks,
     ROUND(100.0 * COUNT(DISTINCT tf.task_id) / NULLIF(COUNT(DISTINCT t.id), 0), 2) as feedback_rate
   FROM tasks t
   LEFT JOIN task_feedback tf ON t.id = tf.task_id
   WHERE t.status = 'completed'
   AND t.completed_at >= NOW() - INTERVAL '7 days';
   ```

3. **Category performance:**
   ```sql
   SELECT
     category,
     COUNT(*) as total,
     COUNT(*) FILTER (WHERE status = 'completed') as completed,
     ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2) as completion_rate
   FROM tasks
   WHERE created_at >= NOW() - INTERVAL '30 days'
   GROUP BY category
   ORDER BY completion_rate DESC;
   ```

4. **Average feedback scores:**
   ```sql
   SELECT
     AVG(difficulty_rating) as avg_difficulty,
     AVG(enjoyment_score) as avg_enjoyment,
     COUNT(*) as total_feedback
   FROM task_feedback
   WHERE created_at >= NOW() - INTERVAL '7 days';
   ```

### Vercel Logs to Monitor:

- Watch for errors in `/api/ai/generate-tasks`
- Watch for errors in `/api/tasks/[id]/feedback`
- Monitor N8N webhook response times
- Check for any RLS policy violations

---

## Known Issues & Limitations

### Current Limitations:

1. **No profile settings page yet**
   - Users can't edit preferences after onboarding
   - TODO: Build profile edit page

2. **N8N workflow not updated**
   - N8N receives new data but may not use it yet
   - TODO: Update N8N AI prompts to use personalization fields

3. **No analytics dashboard**
   - Users can't see their own stats
   - TODO: Build analytics page

### Edge Cases Handled:

- ✅ User with no completed tasks
- ✅ User with no interests
- ✅ User skips feedback modal
- ✅ User skips interests step
- ✅ Existing users (NULL personalization fields)

---

## Success Criteria

Deployment is successful if:

- [x] Build completes without errors
- [ ] Database migration runs successfully
- [ ] New users can complete 6-step onboarding
- [ ] Task generation includes personalization data in logs
- [ ] N8N receives enriched payload
- [ ] Feedback modal appears after task completion
- [ ] Feedback saves to database
- [ ] No critical errors in Vercel logs
- [ ] No RLS policy violations

---

## Next Steps After Deployment

1. **Update N8N Workflow** (HIGH PRIORITY)
   - Modify AI prompts to use new personalization fields
   - Test with real personalization data
   - See example prompts in PERSONALIZATION_IMPLEMENTATION.md

2. **Build Profile Settings Page**
   - Allow users to edit preferences
   - Show current interests
   - Add/remove interests

3. **Monitor User Behavior**
   - Track onboarding completion rates
   - Track feedback submission rates
   - Analyze which categories perform best

4. **Iterate Based on Data**
   - If users skip feedback → Make it shorter
   - If onboarding completion low → Reduce steps
   - If certain fields unused → Remove them

---

## Support & Documentation

- **Full implementation details:** `PERSONALIZATION_IMPLEMENTATION.md`
- **Original plan:** `REDDIT_STRATEGY.md`
- **Code locations:** See PERSONALIZATION_IMPLEMENTATION.md "Files Changed" section

---

**Prepared by:** Claude Code
**Date:** 2026-02-08
**Status:** Ready for deployment ✅
