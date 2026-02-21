/**
 * Character system type definitions, interfaces, and default configuration.
 * Central source of truth for all character-related types.
 */

// ─── Type Definitions ───────────────────────────────────────────────────────

export type ClassType = 'adventurer' | 'thinker' | 'guardian' | 'connector'

export type RankTier =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger'

export type PartType = 'head' | 'body' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg'

// ─── Interfaces ─────────────────────────────────────────────────────────────

/** A single swappable character part with its SVG content */
export interface CharacterPart {
  id: string
  type: PartType
  svgContent: string
  tags: string[]
  requiredRank?: RankTier
}

/** Full character configuration for rendering */
export interface CharacterConfig {
  userId?: string
  class: ClassType
  rank: RankTier
  parts: Record<PartType, string>
  colors: {
    primary: string
    accent: string
    rankColor: string
    glowColor: string
  }
}

/** Tracking state kept in refs — never in React state */
export interface TrackingState {
  isActive: boolean
  cursorX: number
  cursorY: number
  pupilX: number
  pupilY: number
  tiltX: number
  tiltY: number
}

/** Cached bounding rect measurements */
export interface CachedMeasurements {
  charCenterX: number
  charCenterY: number
  zoneLeft: number
  zoneTop: number
  zoneRight: number
  zoneBottom: number
  windowWidth: number
  windowHeight: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const MAX_PUPIL_TRAVEL_X = 8
export const MAX_PUPIL_TRAVEL_Y = 6
export const PUPIL_LERP_FACTOR = 0.12
export const TILT_LERP_FACTOR = 0.04
export const MAX_TILT_X = 3
export const MAX_TILT_Y = 4
export const FLOAT_AMPLITUDE = 6
export const FLOAT_PERIOD = 3000
export const BLINK_MIN_INTERVAL = 4000
export const BLINK_MAX_INTERVAL = 7000
export const RETURN_LERP_FACTOR = 0.06

export const ALL_PART_TYPES: PartType[] = [
  'head',
  'body',
  'leftArm',
  'rightArm',
  'leftLeg',
  'rightLeg',
]

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_PARTS: Record<PartType, string> = {
  head: 'base-head',
  body: 'base-body',
  leftArm: 'base-leftArm',
  rightArm: 'base-rightArm',
  leftLeg: 'base-leftLeg',
  rightLeg: 'base-rightLeg',
}

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  class: 'adventurer',
  rank: 'iron',
  parts: { ...DEFAULT_PARTS },
  colors: {
    primary: '#FF4500',
    accent: '#FFD700',
    rankColor: '#8B8B8B',
    glowColor: '#8B8B8B40',
  },
}
