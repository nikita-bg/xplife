/**
 * Character API — GET and POST endpoints for character configuration.
 * Uses an in-memory store with a swappable storage abstraction.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { CharacterConfig, ClassType, RankTier } from '@/components/character/CharacterConfig'

// ─── Storage Abstraction ────────────────────────────────────────────────────

interface CharacterStorage {
  get(userId: string): Promise<CharacterConfig | null>
  set(userId: string, config: CharacterConfig): Promise<void>
}

/** In-memory storage — swap this with Supabase/Prisma later */
class InMemoryCharacterStorage implements CharacterStorage {
  private store = new Map<string, CharacterConfig>()

  async get(userId: string): Promise<CharacterConfig | null> {
    return this.store.get(userId) ?? null
  }

  async set(userId: string, config: CharacterConfig): Promise<void> {
    this.store.set(userId, config)
  }
}

const storage: CharacterStorage = new InMemoryCharacterStorage()

// ─── Validation ─────────────────────────────────────────────────────────────

const VALID_CLASSES: ClassType[] = ['adventurer', 'thinker', 'guardian', 'connector']
const VALID_RANKS: RankTier[] = [
  'iron', 'bronze', 'silver', 'gold', 'platinum',
  'diamond', 'master', 'grandmaster', 'challenger',
]

function isValidHexColor(value: unknown): boolean {
  return typeof value === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
}

function isValidGlowColor(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return isValidHexColor(value) || /^#[A-Fa-f0-9]{8}$/.test(value) || /^rgba?\(/.test(value)
}

function validateConfig(body: unknown): { valid: true; config: CharacterConfig } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const data = body as Record<string, unknown>

  if (!data.class || !VALID_CLASSES.includes(data.class as ClassType)) {
    return { valid: false, error: `Invalid class. Must be one of: ${VALID_CLASSES.join(', ')}` }
  }

  if (!data.rank || !VALID_RANKS.includes(data.rank as RankTier)) {
    return { valid: false, error: `Invalid rank. Must be one of: ${VALID_RANKS.join(', ')}` }
  }

  if (!data.parts || typeof data.parts !== 'object') {
    return { valid: false, error: 'parts must be an object' }
  }

  if (!data.colors || typeof data.colors !== 'object') {
    return { valid: false, error: 'colors must be an object' }
  }

  const colors = data.colors as Record<string, unknown>
  if (!isValidHexColor(colors.primary)) {
    return { valid: false, error: 'colors.primary must be a valid hex color' }
  }
  if (!isValidHexColor(colors.accent)) {
    return { valid: false, error: 'colors.accent must be a valid hex color' }
  }
  if (!isValidHexColor(colors.rankColor)) {
    return { valid: false, error: 'colors.rankColor must be a valid hex color' }
  }
  if (!isValidGlowColor(colors.glowColor)) {
    return { valid: false, error: 'colors.glowColor must be a valid color string' }
  }

  return {
    valid: true,
    config: {
      userId: typeof data.userId === 'string' ? data.userId : undefined,
      class: data.class as ClassType,
      rank: data.rank as RankTier,
      parts: data.parts as CharacterConfig['parts'],
      colors: data.colors as CharacterConfig['colors'],
    },
  }
}

// ─── Handlers ───────────────────────────────────────────────────────────────

/**
 * GET /api/character?userId=xxx
 * Returns the saved CharacterConfig for the given user, or 404.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId query parameter is required' },
      { status: 400 }
    )
  }

  const config = await storage.get(userId)

  if (!config) {
    return NextResponse.json(
      { error: 'Character config not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(config)
}

/**
 * POST /api/character
 * Saves a CharacterConfig. Requires userId in the body.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const result = validateConfig(body)

  if (!result.valid) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  const { config } = result
  const userId = config.userId ?? 'anonymous'
  config.userId = userId

  await storage.set(userId, config)

  return NextResponse.json({ success: true, config })
}
