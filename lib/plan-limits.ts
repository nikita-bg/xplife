export type PlanType = 'free' | 'premium' | 'lifetime'

export interface PlanLimits {
  maxGoals: number
  maxTasksPerWeek: number   // -1 = unlimited
  chatPerDay: number        // -1 = unlimited
  maxYearlyQuests: number
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free:     { maxGoals: 1, maxTasksPerWeek: 3,  chatPerDay: 15, maxYearlyQuests: 3 },
  premium:  { maxGoals: 3, maxTasksPerWeek: -1, chatPerDay: -1, maxYearlyQuests: 5 },
  lifetime: { maxGoals: 3, maxTasksPerWeek: -1, chatPerDay: -1, maxYearlyQuests: 5 },
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const key = plan as PlanType
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.free
}
