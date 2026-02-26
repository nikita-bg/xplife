# Quest Progress Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the quest progress dashboard bug so tasks from higher time periods correctly count completed tasks from the entire duration of the parent period, rather than just the current sub-period.

**Architecture:** We will add a `startDate` query parameter to `/api/tasks/route.ts` to allow fetching tasks from a specific timestamp instead of the default current-period start. Then, in `DashboardClient.tsx`, we will fetch the necessary historical completed child quests for the active timeframe starting from the beginning of the parent period and use that to accurately calculate the unlock progress.

**Tech Stack:** Next.js (App Router), TypeScript, Supabase

---

### Task 1: Update Tasks API to accept a `startDate` parameter

**Files:**
- Modify: `c:\Users\Nikita\Desktop\xplife_app 2.0\temp-next\src\app\api\tasks\route.ts`

**Step 1: Write minimal implementation**

```typescript
// Replace the date filtering logic in GET
    if (timeframe) {
        query = query.eq('quest_timeframe', timeframe)

        if (!includeHistory) {
            // Check if client provided a specific start date
            const startDate = searchParams.get('startDate')
            
            if (startDate) {
                query = query.gte('created_at', startDate)
            } else {
                // Default: Filter to current period only — prevents expired quests from showing
                const now = new Date()
                let periodStart: string

                if (timeframe === 'daily') {
                    periodStart = `${now.toISOString().split('T')[0]}T00:00:00`
                } else if (timeframe === 'weekly') {
                    const dow = now.getDay()
                    const monOffset = dow === 0 ? 6 : dow - 1
                    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - monOffset)
                    monday.setHours(0, 0, 0, 0)
                    periodStart = monday.toISOString()
                } else if (timeframe === 'monthly') {
                    periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
                } else {
                    // yearly — filter to current year
                    periodStart = new Date(now.getFullYear(), 0, 1).toISOString()
                }

                query = query.gte('created_at', periodStart)
            }
        }
    }
```

**Step 2: Commit**

```bash
git add src/app/api/tasks/route.ts
git commit -m "fix(api): add startDate parameter for custom date filtering in tasks query"
```

---

### Task 2: Fetch full period history for unlock progress in DashboardClient

**Files:**
- Modify: `c:\Users\Nikita\Desktop\xplife_app 2.0\temp-next\src\app\[locale]\(app)\dashboard\DashboardClient.tsx`

**Step 1: Write minimal implementation**

```tsx
// Inside DashboardClient component:

    const [childHistory, setChildHistory] = useState<Task[]>([]);

    const fetchChildHistory = useCallback(async (currentTab: string) => {
        if (!hasRequirements(currentTab as QuestTimeframe)) return;
        const childTf = currentTab === 'weekly' ? 'daily' : currentTab === 'monthly' ? 'weekly' : currentTab === 'yearly' ? 'monthly' : null;
        if (!childTf) return;

        const parentPeriodStart = getPeriodStart(currentTab as QuestTimeframe).toISOString();
        try {
            // Fetch child tasks starting from the parent period start date
            const res = await fetch(`/api/tasks?timeframe=${childTf}&startDate=${parentPeriodStart}&status=completed&limit=200`);
            const data = await res.json();
            setChildHistory(data.tasks || []);
        } catch (err) {
            console.error('Failed to fetch child history', err);
        }
    }, []);

    // Fetch when active tab changes
    useEffect(() => {
        fetchChildHistory(activeTab);
    }, [activeTab, fetchChildHistory]);

    // Also call fetchChildHistory(activeTab) inside handleQuestConfirm to update progress on completion:
    // const handleQuestConfirm = async (...) => { ... if (res.ok) { fetchQuests(); refresh(); fetchChildHistory(activeTab); } }

    // Update currentUnlockStatus calculation to use childHistory:
    const currentUnlockStatus = useMemo(() => {
        if (!hasRequirements(activeTab as QuestTimeframe)) return null;
        const childTf = activeTab === 'weekly' ? 'daily' : activeTab === 'monthly' ? 'weekly' : activeTab === 'yearly' ? 'monthly' : null;
        if (!childTf) return null;

        const parentPeriodStart = getPeriodStart(activeTab as QuestTimeframe);
        const childCompleted = childHistory.filter(
            q => q.status === 'completed' && new Date(q.completed_at || q.created_at) >= parentPeriodStart
        );
        return getUnlockStatus(activeTab as QuestTimeframe, childCompleted, personalityType);
    }, [activeTab, childHistory, personalityType]);
```

**Step 2: Commit**

```bash
git add "src/app/[locale]/(app)/dashboard/DashboardClient.tsx"
git commit -m "fix(dashboard): accurately calculate quest unlock progress across full completion period"
```

---

### Task 3: Fix Setup for `n8n-mcp` Skill

**Goal:** Ensure the `n8n-mcp` skill is properly installed and configured in the MCP configuration file.

**Step 1: Install `n8n-mcp` globally**
Run: `npm install -g n8n-mcp`
Expected: Successfully installs the global package without critical errors.

**Step 2: Add MCP Configuration**
Modify `C:\Users\Nikita\.gemini\antigravity\mcp_config.json` to include the `n8n-mcp` server.

---

### Task 4: Fix Setup for `ui-ux-pro-max-skill`

**Goal:** Ensure Python 3.12 is installed for the design AI skill scripts to work.

**Step 1: Check Python installation**
Run: `python --version`
Expected: If it fails or shows a version < 3.12, proceed to Step 2. Otherwise, skip Step 2.

**Step 2: Install Python via winget (if absent)**
Run: `winget install Python.Python.3.12`
Expected: Successfully installs Python 3.12.
