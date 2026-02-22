/**
 * Character parts assembly engine.
 * Builds complete isometric SVG characters with correct 2:1 isometric projection.
 *
 * Coordinate system:
 *   - X axis → screen bottom-right
 *   - Z axis → screen bottom-left
 *   - Y axis → straight up
 *
 * All coordinates are in "grid units". The character is built on a grid
 * centered at screen position (CX, CY) which is the ground-center of the character.
 */

import type {
  CharacterConfig,
  CharacterPart,
  PartType,
  ClassType,
} from '@/components/character/CharacterConfig'
import { ALL_PART_TYPES } from '@/components/character/CharacterConfig'
import { isRankAtLeast } from './rankColors'

// ─── Isometric Constants ────────────────────────────────────────────────────

/** Half tile width — controls horizontal spread */
const TW = 24
/** Half tile height — TW/2 for true 2:1 isometric */
const TH = 12
/** Pixels per Y-unit (block height) */
const BH = 24
/** SVG center X */
const CX = 150
/** SVG ground-level Y (character bottom) */
const CY = 320

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

/** Lighten a hex color by a percentage (0–100) */
function lighten(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = percent / 100
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f)
}

/** Darken a hex color by a percentage (0–100) */
function darken(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = 1 - percent / 100
  return rgbToHex(r * f, g * f, b * f)
}

/** Get the 3 face colors for an isometric cube from a base color */
function getCubeColors(baseColor: string): {
  top: string
  left: string
  right: string
} {
  return {
    top: lighten(baseColor, 30),
    left: baseColor,
    right: darken(baseColor, 25),
  }
}

// ─── Isometric Projection ───────────────────────────────────────────────────

/** Convert isometric grid coordinates to screen X,Y */
function isoToScreen(
  gx: number,
  gy: number,
  gz: number
): { sx: number; sy: number } {
  return {
    sx: CX + (gx - gz) * TW,
    sy: CY - gy * BH + (gx + gz) * TH,
  }
}

/** Format a screen coordinate as "x,y" string for SVG polygon points */
function pt(gx: number, gy: number, gz: number): string {
  const { sx, sy } = isoToScreen(gx, gy, gz)
  return `${sx.toFixed(1)},${sy.toFixed(1)}`
}

// ─── Isometric Cube Builder ─────────────────────────────────────────────────

interface IsoCubeParams {
  /** Grid X of bottom-front-left corner */
  x: number
  /** Grid Y (height) of bottom */
  y: number
  /** Grid Z of bottom-front-left corner */
  z: number
  /** Width in grid units (along X axis) */
  w: number
  /** Height in grid units (along Y axis) */
  h: number
  /** Depth in grid units (along Z axis) */
  d: number
  /** Base color — top/left/right shading derived automatically */
  color: string
  /** Optional id for the <g> wrapper */
  id?: string
  /** Optional stroke color (defaults to darkened face color) */
  stroke?: string
}

/**
 * Build a single isometric cuboid.
 * Draws 3 visible faces: top (diamond), left (parallelogram), right (parallelogram).
 */
function buildCube(params: IsoCubeParams): string {
  const { x, y, z, w, h, d, color, id, stroke } = params
  const colors = getCubeColors(color)
  const strokeColor = stroke ?? darken(color, 40)

  // Top face (diamond at the top of the cube)
  const topFace = [
    pt(x, y + h, z),
    pt(x + w, y + h, z),
    pt(x + w, y + h, z + d),
    pt(x, y + h, z + d),
  ].join(' ')

  // Left face (visible left side — runs along Z axis at x=x)
  const leftFace = [
    pt(x, y + h, z + d),
    pt(x, y, z + d),
    pt(x + w, y, z + d),
    pt(x + w, y + h, z + d),
  ].join(' ')

  // Right face (visible right side — runs along Z axis at x=x+w)
  const rightFace = [
    pt(x + w, y + h, z),
    pt(x + w, y, z),
    pt(x + w, y, z + d),
    pt(x + w, y + h, z + d),
  ].join(' ')

  const gOpen = id ? `<g id="${id}">` : '<g>'
  return [
    gOpen,
    `  <polygon points="${leftFace}" fill="${colors.left}" stroke="${strokeColor}" stroke-width="0.3" stroke-linejoin="round"/>`,
    `  <polygon points="${rightFace}" fill="${colors.right}" stroke="${strokeColor}" stroke-width="0.3" stroke-linejoin="round"/>`,
    `  <polygon points="${topFace}" fill="${colors.top}" stroke="${strokeColor}" stroke-width="0.3" stroke-linejoin="round"/>`,
    '</g>',
  ].join('\n')
}

// ─── Character Anatomy ─────────────────────────────────────────────────────
// All positions relative to character center at ground level.
// Character faces towards the camera (positive Z direction).
//
// ANATOMY (grid units):
//   Head:       2×2×2 cube  at y=7
//   Body:       2×3×1 slab  at y=4
//   Left arm:   1×3×1       at y=4, x=-1.5
//   Right arm:  1×3×1       at y=4, x=+2.5
//   Left leg:   1×3×1       at y=0, x=-1 (shifted to make gap)
//   Right leg:  1×3×1       at y=0, x=+1 (shifted for gap)
//   Platform:   6×0.4×6     at y=-1

function generatePlatform(
  glowColor: string,
  rankColor: string,
  filterId: string
): string {
  const pw = 6
  const pd = 6
  const ph = 0.4
  const px = -pw / 2
  const pz = -pd / 2
  const py = -1

  let svg = `<g id="platform" filter="url(#${filterId})">\n`
  svg += buildCube({
    x: px,
    y: py,
    z: pz,
    w: pw,
    h: ph,
    d: pd,
    color: '#1a1a2e',
    id: 'platform-base',
  })
  // Glow overlay on top face
  const glowPoints = [
    pt(px + 0.5, py + ph + 0.02, pz + 0.5),
    pt(px + pw - 0.5, py + ph + 0.02, pz + 0.5),
    pt(px + pw - 0.5, py + ph + 0.02, pz + pd - 0.5),
    pt(px + 0.5, py + ph + 0.02, pz + pd - 0.5),
  ].join(' ')
  svg += `\n  <polygon points="${glowPoints}" fill="${glowColor}" opacity="0.5" />`
  // Rank trim border on top
  const trimPoints = [
    pt(px + 0.3, py + ph + 0.03, pz + 0.3),
    pt(px + pw - 0.3, py + ph + 0.03, pz + 0.3),
    pt(px + pw - 0.3, py + ph + 0.03, pz + pd - 0.3),
    pt(px + 0.3, py + ph + 0.03, pz + pd - 0.3),
  ].join(' ')
  svg += `\n  <polygon points="${trimPoints}" fill="none" stroke="${rankColor}" stroke-width="1" />`
  svg += '\n</g>'
  return svg
}

function generateRightLeg(primary: string, rankColor: string): string {
  let svg = '<g id="right-leg">\n'
  svg += buildCube({ x: 0.3, y: 0, z: -0.5, w: 0.9, h: 3, d: 1, color: primary, id: 'right-leg-base' })
  // Boot trim
  svg += '\n' + buildCube({ x: 0.25, y: 0, z: -0.55, w: 1, h: 0.6, d: 1.1, color: rankColor, id: 'right-leg-trim' })
  svg += '\n</g>'
  return svg
}

function generateLeftLeg(primary: string, rankColor: string): string {
  let svg = '<g id="left-leg">\n'
  svg += buildCube({ x: -1.2, y: 0, z: -0.5, w: 0.9, h: 3, d: 1, color: primary, id: 'left-leg-base' })
  // Boot trim
  svg += '\n' + buildCube({ x: -1.25, y: 0, z: -0.55, w: 1, h: 0.6, d: 1.1, color: rankColor, id: 'left-leg-trim' })
  svg += '\n</g>'
  return svg
}

function generateBody(
  primary: string,
  accent: string,
  rankColor: string
): string {
  let svg = '<g id="body">\n'
  // Main torso: 2 units wide (x: -1 to +1), 3 tall, 1 deep
  svg += buildCube({ x: -1, y: 3, z: -0.5, w: 2, h: 4, d: 1, color: primary, id: 'body-base' })
  // Chest accent (centered emblem)
  svg += '\n' + buildCube({ x: -0.5, y: 4.5, z: -0.55, w: 1, h: 1.5, d: 1.1, color: accent, id: 'body-accent' })
  // Belt trim
  svg += '\n' + buildCube({ x: -1.05, y: 3, z: -0.55, w: 2.1, h: 0.6, d: 1.1, color: rankColor, id: 'body-trim' })
  svg += '\n</g>'
  return svg
}

function generateRightArm(primary: string, rankColor: string): string {
  let svg = '<g id="right-arm">\n'
  svg += buildCube({ x: 1.1, y: 4, z: -0.4, w: 0.8, h: 3, d: 0.8, color: primary, id: 'right-arm-base' })
  // Shoulder trim
  svg += '\n' + buildCube({ x: 1.05, y: 6.4, z: -0.45, w: 0.9, h: 0.6, d: 0.9, color: rankColor, id: 'right-arm-trim' })
  svg += '\n</g>'
  return svg
}

function generateLeftArm(primary: string, rankColor: string): string {
  let svg = '<g id="left-arm">\n'
  svg += buildCube({ x: -1.9, y: 4, z: -0.4, w: 0.8, h: 3, d: 0.8, color: primary, id: 'left-arm-base' })
  // Shoulder trim
  svg += '\n' + buildCube({ x: -1.95, y: 6.4, z: -0.45, w: 0.9, h: 0.6, d: 0.9, color: rankColor, id: 'left-arm-trim' })
  svg += '\n</g>'
  return svg
}

function generateHead(
  primary: string,
  accent: string,
  rankColor: string,
  filterId: string
): string {
  let svg = '<g id="head">\n'
  // Head cube: 2×2×2, centered on character, sitting on top of body
  svg += buildCube({ x: -1, y: 7, z: -1, w: 2, h: 2, d: 2, color: primary, id: 'head-base' })
  // Helmet band trim
  svg += '\n' + buildCube({ x: -1.05, y: 8.3, z: -1.05, w: 2.1, h: 0.5, d: 2.1, color: rankColor, id: 'head-trim' })

  // ── Eyes ──
  const eyeZ = 1.02
  const eyeY = 7.8

  svg += '\n<g id="eyes">'
  svg += `\n  <polygon points="${pt(-0.7, eyeY, eyeZ)} ${pt(-0.1, eyeY, eyeZ)} ${pt(-0.1, eyeY + 0.6, eyeZ)} ${pt(-0.7, eyeY + 0.6, eyeZ)}" fill="#0d0d2b" />`
  svg += `\n  <polygon points="${pt(0.1, eyeY, eyeZ)} ${pt(0.7, eyeY, eyeZ)} ${pt(0.7, eyeY + 0.6, eyeZ)} ${pt(0.1, eyeY + 0.6, eyeZ)}" fill="#0d0d2b" />`
  svg += '\n</g>'

  // Pupils (cursor-tracked)
  const pupilY = eyeY + 0.15
  svg += '\n<g id="pupils" class="pupils-track">'
  svg += `\n  <polygon points="${pt(-0.6, pupilY, eyeZ + 0.01)} ${pt(-0.2, pupilY, eyeZ + 0.01)} ${pt(-0.2, pupilY + 0.35, eyeZ + 0.01)} ${pt(-0.6, pupilY + 0.35, eyeZ + 0.01)}" fill="${accent}" filter="url(#${filterId})"/>`
  svg += `\n  <polygon points="${pt(0.2, pupilY, eyeZ + 0.01)} ${pt(0.6, pupilY, eyeZ + 0.01)} ${pt(0.6, pupilY + 0.35, eyeZ + 0.01)} ${pt(0.2, pupilY + 0.35, eyeZ + 0.01)}" fill="${accent}" filter="url(#${filterId})"/>`
  svg += '\n</g>'

  svg += '\n</g>'
  return svg
}

// ─── Class Accessories (3D isometric) ───────────────────────────────────────

function generateClassAccessories(
  classType: ClassType,
  primary: string,
  accent: string,
  rankColor: string,
  filterId: string
): string {
  switch (classType) {
    case 'adventurer':
      return generateAdventurerAccessories(accent, rankColor)
    case 'thinker':
      return generateThinkerAccessories(accent, rankColor, filterId)
    case 'guardian':
      return generateGuardianAccessories(accent, rankColor)
    case 'connector':
      return generateConnectorAccessories(accent, rankColor, filterId)
    default:
      return ''
  }
}

function generateAdventurerAccessories(accent: string, rankColor: string): string {
  let svg = '<g id="class-accessories">\n'
  // Explorer hat brim — flat wide cube on head
  svg += buildCube({ x: -1.4, y: 9.05, z: -1.4, w: 2.8, h: 0.2, d: 2.8, color: darken(rankColor, 10), id: 'hat-brim' })
  // Hat crown
  svg += '\n' + buildCube({ x: -0.7, y: 9.2, z: -0.7, w: 1.4, h: 0.9, d: 1.4, color: rankColor, id: 'hat-crown' })
  // Hat band accent
  svg += '\n' + buildCube({ x: -0.75, y: 9.2, z: -0.75, w: 1.5, h: 0.25, d: 1.5, color: accent, id: 'hat-band' })
  // Compass on chest — small accent cube
  svg += '\n' + buildCube({ x: -0.3, y: 5.2, z: -0.58, w: 0.6, h: 0.6, d: 0.16, color: accent, id: 'compass' })
  svg += '\n</g>'
  return svg
}

function generateThinkerAccessories(accent: string, rankColor: string, filterId: string): string {
  let svg = '<g id="class-accessories">\n'
  // Glasses — two small cubes on the face
  const eyeZ = 1.05
  const glassY = 7.7
  // Left lens frame
  svg += `  <polygon points="${pt(-0.8, glassY, eyeZ)} ${pt(-0.05, glassY, eyeZ)} ${pt(-0.05, glassY + 0.75, eyeZ)} ${pt(-0.8, glassY + 0.75, eyeZ)}" fill="none" stroke="${accent}" stroke-width="1.2" />\n`
  // Right lens frame
  svg += `  <polygon points="${pt(0.05, glassY, eyeZ)} ${pt(0.8, glassY, eyeZ)} ${pt(0.8, glassY + 0.75, eyeZ)} ${pt(0.05, glassY + 0.75, eyeZ)}" fill="none" stroke="${accent}" stroke-width="1.2" />\n`
  // Bridge
  svg += `  <line x1="${isoToScreen(-0.05, glassY + 0.4, eyeZ).sx}" y1="${isoToScreen(-0.05, glassY + 0.4, eyeZ).sy}" x2="${isoToScreen(0.05, glassY + 0.4, eyeZ).sx}" y2="${isoToScreen(0.05, glassY + 0.4, eyeZ).sy}" stroke="${accent}" stroke-width="1" />\n`
  // Floating book next to right arm
  svg += buildCube({ x: 2.2, y: 5.5, z: -0.3, w: 0.8, h: 1.0, d: 0.15, color: rankColor, id: 'book' })
  svg += '\n' + buildCube({ x: 2.22, y: 5.55, z: -0.32, w: 0.76, h: 0.9, d: 0.11, color: lighten(rankColor, 30), id: 'book-pages' })
  svg += '\n</g>'
  return svg
}

function generateGuardianAccessories(accent: string, rankColor: string): string {
  let svg = '<g id="class-accessories">\n'
  // Helmet visor — extra cube on front of head
  svg += buildCube({ x: -1.1, y: 7.8, z: 0.9, w: 2.2, h: 0.4, d: 0.3, color: darken(rankColor, 15), id: 'visor' })
  // Shield on left side — flat tall cube
  svg += '\n' + buildCube({ x: -2.6, y: 3.5, z: -0.5, w: 0.2, h: 3.0, d: 1.5, color: rankColor, id: 'shield-base' })
  svg += '\n' + buildCube({ x: -2.62, y: 4.0, z: -0.2, w: 0.22, h: 1.5, d: 0.8, color: accent, id: 'shield-emblem' })
  // Shoulder pads — small cubes on shoulders
  svg += '\n' + buildCube({ x: 1.0, y: 6.8, z: -0.6, w: 1.1, h: 0.4, d: 1.0, color: rankColor, id: 'right-pauldron' })
  svg += '\n' + buildCube({ x: -2.1, y: 6.8, z: -0.6, w: 1.1, h: 0.4, d: 1.0, color: rankColor, id: 'left-pauldron' })
  svg += '\n</g>'
  return svg
}

function generateConnectorAccessories(accent: string, rankColor: string, filterId: string): string {
  let svg = '<g id="class-accessories">\n'
  // Antenna on head — thin tall cube
  svg += buildCube({ x: 0.6, y: 9.0, z: -0.1, w: 0.15, h: 1.5, d: 0.15, color: accent, id: 'antenna-rod' })
  // Antenna tip — glowing cube
  svg += '\n' + buildCube({ x: 0.5, y: 10.5, z: -0.2, w: 0.35, h: 0.35, d: 0.35, color: lighten(accent, 40), id: 'antenna-tip' })
  // Signal waves — isometric arcs using polygons
  const tipScreen = isoToScreen(0.7, 10.8, 0)
  svg += `\n  <path d="M${tipScreen.sx + 6},${tipScreen.sy - 8} a8,8 0 0,1 0,12" fill="none" stroke="${accent}" stroke-width="1" opacity="0.5" />`
  svg += `\n  <path d="M${tipScreen.sx + 10},${tipScreen.sy - 12} a12,12 0 0,1 0,18" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.3" />`
  // Connected nodes on body — small accent cubes
  svg += '\n' + buildCube({ x: -0.4, y: 4.8, z: -0.58, w: 0.25, h: 0.25, d: 0.16, color: accent, id: 'node-1' })
  svg += '\n' + buildCube({ x: 0.2, y: 5.3, z: -0.58, w: 0.25, h: 0.25, d: 0.16, color: accent, id: 'node-2' })
  svg += '\n' + buildCube({ x: -0.1, y: 5.8, z: -0.58, w: 0.25, h: 0.25, d: 0.16, color: rankColor, id: 'node-3' })
  // Connection lines between nodes
  const n1 = isoToScreen(-0.28, 4.93, -0.5)
  const n2 = isoToScreen(0.33, 5.43, -0.5)
  const n3 = isoToScreen(0.03, 5.93, -0.5)
  svg += `\n  <line x1="${n1.sx}" y1="${n1.sy}" x2="${n2.sx}" y2="${n2.sy}" stroke="${accent}" stroke-width="0.6" opacity="0.5" />`
  svg += `\n  <line x1="${n2.sx}" y1="${n2.sy}" x2="${n3.sx}" y2="${n3.sy}" stroke="${accent}" stroke-width="0.6" opacity="0.5" />`
  svg += `\n  <line x1="${n3.sx}" y1="${n3.sy}" x2="${n1.sx}" y2="${n1.sy}" stroke="${accent}" stroke-width="0.6" opacity="0.4" />`
  svg += '\n</g>'
  return svg
}

// ─── Debug Overlay ──────────────────────────────────────────────────────────

function generateDebugOverlay(): string {
  let svg = '<g id="debug-overlay" opacity="0.4">\n'

  // Draw grid lines
  for (let i = -4; i <= 4; i++) {
    // X-axis lines
    svg += `  <line x1="${isoToScreen(i, 0, -4).sx}" y1="${isoToScreen(i, 0, -4).sy}" x2="${isoToScreen(i, 0, 4).sx}" y2="${isoToScreen(i, 0, 4).sy}" stroke="#444" stroke-width="0.3" />\n`
    // Z-axis lines
    svg += `  <line x1="${isoToScreen(-4, 0, i).sx}" y1="${isoToScreen(-4, 0, i).sy}" x2="${isoToScreen(4, 0, i).sx}" y2="${isoToScreen(4, 0, i).sy}" stroke="#444" stroke-width="0.3" />\n`
  }

  // Part labels
  const labels: Array<{ label: string; gx: number; gy: number; gz: number }> = [
    { label: 'Head', gx: 0, gy: 9.5, gz: 0 },
    { label: 'Body', gx: 0, gy: 5.5, gz: 0 },
    { label: 'L.Arm', gx: -2.5, gy: 5.5, gz: 0 },
    { label: 'R.Arm', gx: 2.5, gy: 5.5, gz: 0 },
    { label: 'L.Leg', gx: -1.5, gy: 1.5, gz: 0 },
    { label: 'R.Leg', gx: 1.5, gy: 1.5, gz: 0 },
  ]

  for (const { label, gx, gy, gz } of labels) {
    const { sx, sy } = isoToScreen(gx, gy, gz)
    svg += `  <text x="${sx}" y="${sy}" fill="#0f0" font-size="6" text-anchor="middle" font-family="monospace">${label}</text>\n`
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
 * Assemble a complete character SVG from configuration.
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
  const weaponSvg = (config as { equippedWeaponSvg?: string | null }).equippedWeaponSvg

  // Build registry lookup for custom parts
  const registryMap = new Map<string, CharacterPart>()
  for (const part of registry) {
    registryMap.set(part.id, part)
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">\n`
  svg += `<defs>\n`
  svg += `  <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">\n`
  svg += `    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>\n`
  svg += `    <feMerge>\n`
  svg += `      <feMergeNode in="coloredBlur"/>\n`
  svg += `      <feMergeNode in="SourceGraphic"/>\n`
  svg += `    </feMerge>\n`
  svg += `  </filter>\n`
  svg += `</defs>\n`

  // Debug grid
  if (debug) {
    svg += generateDebugOverlay() + '\n'
  }

  // Platform (always behind everything)
  svg += generatePlatform(glowColor, rankColor, filterId) + '\n'

  // Character root group (receives idle float animation + body tilt)
  svg += `<g id="character-root" class="character-idle" style="transform-origin: ${CX}px ${CY}px;">\n`

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
  // 1. Right arm (behind body, higher X)
  svg += getPartSvg('rightArm', () => generateRightArm(primary, rankColor)) + '\n'
  // 2. Right leg
  svg += getPartSvg('rightLeg', () => generateRightLeg(primary, rankColor)) + '\n'
  // 3. Left leg
  svg += getPartSvg('leftLeg', () => generateLeftLeg(primary, rankColor)) + '\n'
  // 4. Body (center)
  svg += getPartSvg('body', () => generateBody(primary, accent, rankColor)) + '\n'
  // 5. Left arm (in front, lower X)
  svg += getPartSvg('leftArm', () => generateLeftArm(primary, rankColor)) + '\n'
  // 6. Head (on top of everything)
  svg += getPartSvg('head', () => generateHead(primary, accent, rankColor, filterId)) + '\n'

  // 7. Class accessories (overlaid on character)
  svg += generateClassAccessories(config.class, primary, accent, rankColor, filterId) + '\n'

  // 8. Weapon (if equipped — rendered after head, in right arm area)
  if (weaponSvg) {
    const weaponPos = isoToScreen(1.8, 4, 0)
    svg += `<g id="equipped-weapon" transform="translate(${weaponPos.sx - 20}, ${weaponPos.sy - 50}) scale(0.4)">\n`
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
