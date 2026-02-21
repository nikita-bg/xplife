/**
 * Character parts assembly engine — Notion / Gaming flat SVG avatar style.
 *
 * Builds clean, rounded, flat 2D characters with class-specific accessories.
 * Maintains all element IDs (#character-root, #eyes, #pupils, #head, #body, etc.)
 * so that eye tracking, idle float animation, and blink continue to work.
 *
 * SVG viewBox: 0 0 300 400
 * Character anchor: center-bottom at (150, 340)
 */

import type {
  CharacterConfig,
  CharacterPart,
  PartType,
  ClassType,
} from '@/components/character/CharacterConfig'
import { ALL_PART_TYPES } from '@/components/character/CharacterConfig'
import { isRankAtLeast } from './rankColors'

// ─── Color Utilities ────────────────────────────────────────────────────────

function clampByte(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)))
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((c) => clampByte(c).toString(16).padStart(2, '0'))
      .join('')
  )
}

function lighten(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = percent / 100
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f)
}

function darken(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = 1 - percent / 100
  return rgbToHex(r * f, g * f, b * f)
}

// ─── Layout Constants ───────────────────────────────────────────────────────
// Character is centered at x=150, standing on y≈340

const CX = 150 // center X
const GROUND_Y = 340 // feet bottom

// Body proportions (all relative to CX, GROUND_Y)
const HEAD_W = 64
const HEAD_H = 64
const HEAD_R = 16 // border radius
const BODY_W = 56
const BODY_H = 70
const BODY_R = 12
const ARM_W = 16
const ARM_H = 52
const ARM_R = 8
const LEG_W = 18
const LEG_H = 46
const LEG_R = 8
const LEG_GAP = 6 // gap between legs

// Computed positions
const BODY_TOP = GROUND_Y - LEG_H - BODY_H
const HEAD_TOP = BODY_TOP - HEAD_H + 6 // slight overlap
const LEG_TOP = GROUND_Y - LEG_H
const ARM_TOP = BODY_TOP + 8

// ─── Platform ───────────────────────────────────────────────────────────────

function generatePlatform(
  glowColor: string,
  rankColor: string,
  filterId: string
): string {
  const pw = 100
  const ph = 8
  const px = CX - pw / 2
  const py = GROUND_Y

  return `<g id="platform" filter="url(#${filterId})">
  <ellipse cx="${CX}" cy="${py + 4}" rx="${pw / 2}" ry="${ph}" fill="#1a1a2e" />
  <ellipse cx="${CX}" cy="${py + 4}" rx="${pw / 2 - 4}" ry="${ph - 2}" fill="${glowColor}" opacity="0.35" />
  <ellipse cx="${CX}" cy="${py + 4}" rx="${pw / 2 - 2}" ry="${ph - 1}" fill="none" stroke="${rankColor}" stroke-width="1.2" opacity="0.7" />
</g>`
}

// ─── Legs ───────────────────────────────────────────────────────────────────

function generateRightLeg(primary: string, rankColor: string): string {
  const x = CX + LEG_GAP / 2
  return `<g id="right-leg">
  <rect x="${x}" y="${LEG_TOP}" width="${LEG_W}" height="${LEG_H}" rx="${LEG_R}" fill="${primary}" />
  <rect x="${x - 1}" y="${GROUND_Y - 12}" width="${LEG_W + 2}" height="12" rx="4" fill="${rankColor}" opacity="0.85" />
</g>`
}

function generateLeftLeg(primary: string, rankColor: string): string {
  const x = CX - LEG_GAP / 2 - LEG_W
  return `<g id="left-leg">
  <rect x="${x}" y="${LEG_TOP}" width="${LEG_W}" height="${LEG_H}" rx="${LEG_R}" fill="${primary}" />
  <rect x="${x - 1}" y="${GROUND_Y - 12}" width="${LEG_W + 2}" height="12" rx="4" fill="${rankColor}" opacity="0.85" />
</g>`
}

// ─── Body ───────────────────────────────────────────────────────────────────

function generateBody(
  primary: string,
  accent: string,
  rankColor: string
): string {
  const bx = CX - BODY_W / 2
  return `<g id="body">
  <rect id="body-base" x="${bx}" y="${BODY_TOP}" width="${BODY_W}" height="${BODY_H}" rx="${BODY_R}" fill="${primary}" />
  <!-- chest accent -->
  <rect id="body-accent" x="${CX - 14}" y="${BODY_TOP + 14}" width="28" height="24" rx="6" fill="${accent}" opacity="0.85" />
  <!-- belt -->
  <rect id="body-trim" x="${bx - 2}" y="${BODY_TOP + BODY_H - 14}" width="${BODY_W + 4}" height="10" rx="4" fill="${rankColor}" opacity="0.8" />
</g>`
}

// ─── Arms ───────────────────────────────────────────────────────────────────

function generateRightArm(primary: string, rankColor: string): string {
  const ax = CX + BODY_W / 2 + 2
  return `<g id="right-arm">
  <rect id="right-arm-base" x="${ax}" y="${ARM_TOP}" width="${ARM_W}" height="${ARM_H}" rx="${ARM_R}" fill="${primary}" />
  <rect id="right-arm-trim" x="${ax - 1}" y="${ARM_TOP}" width="${ARM_W + 2}" height="10" rx="4" fill="${rankColor}" opacity="0.7" />
</g>`
}

function generateLeftArm(primary: string, rankColor: string): string {
  const ax = CX - BODY_W / 2 - ARM_W - 2
  return `<g id="left-arm">
  <rect id="left-arm-base" x="${ax}" y="${ARM_TOP}" width="${ARM_W}" height="${ARM_H}" rx="${ARM_R}" fill="${primary}" />
  <rect id="left-arm-trim" x="${ax - 1}" y="${ARM_TOP}" width="${ARM_W + 2}" height="10" rx="4" fill="${rankColor}" opacity="0.7" />
</g>`
}

// ─── Head ────────────────────────────────────────────────────────────────────

function generateHead(
  primary: string,
  accent: string,
  rankColor: string,
  filterId: string
): string {
  const hx = CX - HEAD_W / 2
  const eyeY = HEAD_TOP + HEAD_H * 0.48
  const eyeW = 14
  const eyeH = 16
  const eyeGap = 8
  const leftEyeX = CX - eyeGap / 2 - eyeW
  const rightEyeX = CX + eyeGap / 2
  const pupilW = 7
  const pupilH = 8
  const pupilOffY = 4

  return `<g id="head">
  <!-- Head base -->
  <rect id="head-base" x="${hx}" y="${HEAD_TOP}" width="${HEAD_W}" height="${HEAD_H}" rx="${HEAD_R}" fill="${primary}" />
  <!-- Helmet band -->
  <rect id="head-trim" x="${hx - 2}" y="${HEAD_TOP + 4}" width="${HEAD_W + 4}" height="10" rx="5" fill="${rankColor}" opacity="0.8" />

  <!-- Eyes -->
  <g id="eyes">
    <rect x="${leftEyeX}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="4" fill="#0d0d2b" />
    <rect x="${rightEyeX}" y="${eyeY}" width="${eyeW}" height="${eyeH}" rx="4" fill="#0d0d2b" />
  </g>

  <!-- Pupils (cursor-tracked) -->
  <g id="pupils" class="pupils-track">
    <rect x="${leftEyeX + 3}" y="${eyeY + pupilOffY}" width="${pupilW}" height="${pupilH}" rx="2" fill="${accent}" filter="url(#${filterId})" />
    <rect x="${rightEyeX + 3}" y="${eyeY + pupilOffY}" width="${pupilW}" height="${pupilH}" rx="2" fill="${accent}" filter="url(#${filterId})" />
  </g>

  <!-- Mouth — small friendly line -->
  <rect x="${CX - 6}" y="${eyeY + eyeH + 6}" width="12" height="3" rx="1.5" fill="#0d0d2b" opacity="0.5" />
</g>`
}

// ─── Class Accessories ──────────────────────────────────────────────────────

function generateClassAccessories(
  classType: ClassType,
  primary: string,
  accent: string,
  rankColor: string
): string {
  switch (classType) {
    case 'adventurer':
      return generateAdventurerAccessories(primary, accent, rankColor)
    case 'thinker':
      return generateThinkerAccessories(primary, accent, rankColor)
    case 'guardian':
      return generateGuardianAccessories(primary, accent, rankColor)
    case 'connector':
      return generateConnectorAccessories(primary, accent, rankColor)
    default:
      return ''
  }
}

function generateAdventurerAccessories(
  _primary: string,
  accent: string,
  rankColor: string
): string {
  // Explorer hat + compass on chest
  const hatY = HEAD_TOP - 8
  const hatCx = CX
  return `<g id="class-accessories">
  <!-- Explorer hat -->
  <ellipse cx="${hatCx}" cy="${hatY + 6}" rx="38" ry="5" fill="${darken(rankColor, 15)}" />
  <rect x="${hatCx - 18}" y="${hatY - 12}" width="36" height="18" rx="8" fill="${rankColor}" />
  <rect x="${hatCx - 12}" y="${hatY - 6}" width="24" height="4" rx="2" fill="${accent}" opacity="0.7" />
  <!-- Compass icon on chest -->
  <circle cx="${CX}" cy="${BODY_TOP + 26}" r="8" fill="none" stroke="${accent}" stroke-width="1.5" />
  <line x1="${CX}" y1="${BODY_TOP + 20}" x2="${CX + 4}" y2="${BODY_TOP + 28}" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" />
  <line x1="${CX}" y1="${BODY_TOP + 20}" x2="${CX - 3}" y2="${BODY_TOP + 24}" stroke="${rankColor}" stroke-width="1" stroke-linecap="round" />
</g>`
}

function generateThinkerAccessories(
  _primary: string,
  accent: string,
  rankColor: string
): string {
  // Glasses + floating book
  const glassY = HEAD_TOP + HEAD_H * 0.44
  const earL = CX - HEAD_W / 2 - 3
  const earR = CX + HEAD_W / 2 + 3
  return `<g id="class-accessories">
  <!-- Glasses -->
  <rect x="${CX - 20}" y="${glassY}" width="16" height="14" rx="4" fill="none" stroke="${accent}" stroke-width="1.8" />
  <rect x="${CX + 4}" y="${glassY}" width="16" height="14" rx="4" fill="none" stroke="${accent}" stroke-width="1.8" />
  <line x1="${CX - 4}" y1="${glassY + 7}" x2="${CX + 4}" y2="${glassY + 7}" stroke="${accent}" stroke-width="1.5" />
  <line x1="${earL + 3}" y1="${glassY + 4}" x2="${CX - 20}" y2="${glassY + 4}" stroke="${accent}" stroke-width="1.2" />
  <line x1="${earR - 3}" y1="${glassY + 4}" x2="${CX + 20}" y2="${glassY + 4}" stroke="${accent}" stroke-width="1.2" />
  <!-- Floating book -->
  <g transform="translate(${CX + BODY_W / 2 + 18}, ${BODY_TOP + 12}) rotate(-10)">
    <rect width="20" height="26" rx="2" fill="${rankColor}" />
    <rect x="2" y="2" width="16" height="22" rx="1" fill="${lighten(rankColor, 30)}" />
    <line x1="6" y1="8" x2="16" y2="8" stroke="${accent}" stroke-width="1" opacity="0.6" />
    <line x1="6" y1="12" x2="14" y2="12" stroke="${accent}" stroke-width="1" opacity="0.6" />
    <line x1="6" y1="16" x2="12" y2="16" stroke="${accent}" stroke-width="1" opacity="0.6" />
  </g>
</g>`
}

function generateGuardianAccessories(
  _primary: string,
  accent: string,
  rankColor: string
): string {
  // Shield + sturdy helmet visor
  return `<g id="class-accessories">
  <!-- Helmet visor -->
  <rect x="${CX - HEAD_W / 2 - 4}" y="${HEAD_TOP + HEAD_H * 0.35}" width="${HEAD_W + 8}" height="6" rx="3" fill="${rankColor}" opacity="0.9" />
  <!-- Shield on left side -->
  <g transform="translate(${CX - BODY_W / 2 - ARM_W - 16}, ${ARM_TOP + 8})">
    <path d="M0,0 L20,0 L20,28 L10,36 L0,28 Z" fill="${rankColor}" opacity="0.9" />
    <path d="M3,3 L17,3 L17,26 L10,32 L3,26 Z" fill="${lighten(rankColor, 25)}" />
    <path d="M10,8 L14,14 L10,20 L6,14 Z" fill="${accent}" opacity="0.8" />
  </g>
  <!-- Shoulder pads -->
  <ellipse cx="${CX - BODY_W / 2 - 4}" cy="${ARM_TOP + 6}" rx="10" ry="6" fill="${rankColor}" opacity="0.7" />
  <ellipse cx="${CX + BODY_W / 2 + 4}" cy="${ARM_TOP + 6}" rx="10" ry="6" fill="${rankColor}" opacity="0.7" />
</g>`
}

function generateConnectorAccessories(
  _primary: string,
  accent: string,
  rankColor: string
): string {
  // Antenna + signal waves + connected nodes
  return `<g id="class-accessories">
  <!-- Antenna -->
  <line x1="${CX + 14}" y1="${HEAD_TOP + 2}" x2="${CX + 22}" y2="${HEAD_TOP - 20}" stroke="${accent}" stroke-width="2" stroke-linecap="round" />
  <circle cx="${CX + 22}" cy="${HEAD_TOP - 22}" r="4" fill="${accent}" />
  <circle cx="${CX + 22}" cy="${HEAD_TOP - 22}" r="2" fill="${lighten(accent, 50)}" />
  <!-- Signal waves -->
  <path d="M${CX + 28},${HEAD_TOP - 28} a12,12 0 0,1 0,16" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.5" />
  <path d="M${CX + 32},${HEAD_TOP - 32} a18,18 0 0,1 0,24" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3" />
  <!-- Connected nodes on body -->
  <circle cx="${CX - 8}" cy="${BODY_TOP + 22}" r="3" fill="${accent}" />
  <circle cx="${CX + 8}" cy="${BODY_TOP + 30}" r="3" fill="${accent}" />
  <circle cx="${CX}" cy="${BODY_TOP + 16}" r="3" fill="${rankColor}" />
  <line x1="${CX}" y1="${BODY_TOP + 16}" x2="${CX - 8}" y2="${BODY_TOP + 22}" stroke="${accent}" stroke-width="1" opacity="0.6" />
  <line x1="${CX}" y1="${BODY_TOP + 16}" x2="${CX + 8}" y2="${BODY_TOP + 30}" stroke="${accent}" stroke-width="1" opacity="0.6" />
  <line x1="${CX - 8}" y1="${BODY_TOP + 22}" x2="${CX + 8}" y2="${BODY_TOP + 30}" stroke="${accent}" stroke-width="1" opacity="0.4" />
</g>`
}

// ─── Debug Overlay ──────────────────────────────────────────────────────────

function generateDebugOverlay(): string {
  let svg = '<g id="debug-overlay" opacity="0.4">\n'

  // Grid lines
  for (let x = 0; x <= 300; x += 25) {
    svg += `  <line x1="${x}" y1="0" x2="${x}" y2="400" stroke="#333" stroke-width="0.3" />\n`
  }
  for (let y = 0; y <= 400; y += 25) {
    svg += `  <line x1="0" y1="${y}" x2="300" y2="${y}" stroke="#333" stroke-width="0.3" />\n`
  }

  // Part labels
  const labels = [
    { label: 'Head', x: CX, y: HEAD_TOP - 8 },
    { label: 'Body', x: CX, y: BODY_TOP + BODY_H / 2 },
    { label: 'L.Arm', x: CX - BODY_W / 2 - ARM_W - 4, y: ARM_TOP + ARM_H / 2 },
    { label: 'R.Arm', x: CX + BODY_W / 2 + ARM_W + 4, y: ARM_TOP + ARM_H / 2 },
    { label: 'L.Leg', x: CX - LEG_GAP / 2 - LEG_W / 2, y: LEG_TOP + LEG_H / 2 },
    { label: 'R.Leg', x: CX + LEG_GAP / 2 + LEG_W / 2, y: LEG_TOP + LEG_H / 2 },
  ]
  for (const { label, x, y } of labels) {
    svg += `  <text x="${x}" y="${y}" fill="#0f0" font-size="6" text-anchor="middle" font-family="monospace">${label}</text>\n`
  }
  svg += '</g>'
  return svg
}

// ─── Fallback SVG ───────────────────────────────────────────────────────────

export const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <g transform="translate(150, 170)">
    <circle cx="0" cy="-50" r="20" fill="none" stroke="#666" stroke-width="2"/>
    <line x1="0" y1="-30" x2="0" y2="30" stroke="#666" stroke-width="2"/>
    <line x1="-25" y1="-10" x2="25" y2="-10" stroke="#666" stroke-width="2"/>
    <line x1="0" y1="30" x2="-20" y2="70" stroke="#666" stroke-width="2"/>
    <line x1="0" y1="30" x2="20" y2="70" stroke="#666" stroke-width="2"/>
  </g>
</svg>`

// ─── Assembly ───────────────────────────────────────────────────────────────

/**
 * Assemble a complete flat-style character SVG from configuration.
 * Renders parts in painter's algorithm order (back → front).
 */
export function assembleCharacter(
  config: CharacterConfig,
  registry: CharacterPart[] = [],
  debug: boolean = false
): string {
  const { colors } = config
  const { primary, accent, rankColor, glowColor } = colors
  const filterId = `glow-${config.userId ?? 'char'}`

  // Build registry lookup for custom parts
  const registryMap = new Map<string, CharacterPart>()
  for (const part of registry) {
    registryMap.set(part.id, part)
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">\n`
  svg += `<defs>\n`
  svg += `  <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">\n`
  svg += `    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>\n`
  svg += `    <feMerge>\n`
  svg += `      <feMergeNode in="coloredBlur"/>\n`
  svg += `      <feMergeNode in="SourceGraphic"/>\n`
  svg += `    </feMerge>\n`
  svg += `  </filter>\n`
  // Subtle body shadow
  svg += `  <filter id="body-shadow" x="-10%" y="-10%" width="120%" height="130%">\n`
  svg += `    <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.25"/>\n`
  svg += `  </filter>\n`
  svg += `</defs>\n`

  // Debug grid
  if (debug) {
    svg += generateDebugOverlay() + '\n'
  }

  // Platform
  svg += generatePlatform(glowColor, rankColor, filterId) + '\n'

  // Character root group (receives idle float animation + body tilt)
  svg += `<g id="character-root" class="character-idle" style="transform-origin: ${CX}px ${GROUND_Y}px;" filter="url(#body-shadow)">\n`

  // Helper to get custom part or generate default
  const getPartSvg = (
    partType: PartType,
    generator: () => string
  ): string => {
    const partId = config.parts[partType]
    const custom = registryMap.get(partId)
    return custom ? custom.svgContent : generator()
  }

  // Render order (back to front):
  // 1. Right arm (behind body)
  svg += getPartSvg('rightArm', () => generateRightArm(primary, rankColor)) + '\n'
  // 2. Right leg
  svg += getPartSvg('rightLeg', () => generateRightLeg(primary, rankColor)) + '\n'
  // 3. Left leg
  svg += getPartSvg('leftLeg', () => generateLeftLeg(primary, rankColor)) + '\n'
  // 4. Body
  svg += getPartSvg('body', () => generateBody(primary, accent, rankColor)) + '\n'
  // 5. Left arm (in front)
  svg += getPartSvg('leftArm', () => generateLeftArm(primary, rankColor)) + '\n'
  // 6. Head (on top)
  svg += getPartSvg('head', () => generateHead(primary, accent, rankColor, filterId)) + '\n'

  // 7. Class accessories (overlaid on top)
  svg += generateClassAccessories(config.class, primary, accent, rankColor) + '\n'

  // 8. Weapon (if equipped — rendered after everything)
  const weaponSvg = (config as { equippedWeaponSvg?: string | null }).equippedWeaponSvg
  if (weaponSvg) {
    const weaponX = CX + BODY_W / 2 + ARM_W + 6
    const weaponY = ARM_TOP - 10
    svg += `<g id="equipped-weapon" transform="translate(${weaponX - 20}, ${weaponY}) scale(0.4)">\n`
    svg += `  <image href="${weaponSvg}" width="128" height="128" />\n`
    svg += '</g>\n'
  }

  svg += `</g>\n`
  svg += `</svg>`

  return svg
}

/**
 * Filter parts registry to only return parts accessible at the user's current rank.
 */
export function getAvailableParts(
  config: CharacterConfig,
  registry: CharacterPart[]
): CharacterPart[] {
  return registry.filter((part) => {
    if (!part.requiredRank) return true
    return isRankAtLeast(config.rank, part.requiredRank)
  })
}

/**
 * Get default parts for all part types.
 */
export function getDefaultParts(): Record<PartType, string> {
  const parts: Partial<Record<PartType, string>> = {}
  for (const partType of ALL_PART_TYPES) {
    parts[partType] = `base-${partType}`
  }
  return parts as Record<PartType, string>
}
