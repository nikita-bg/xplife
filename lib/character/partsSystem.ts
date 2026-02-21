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
  // Eyes sit on the front face of the head (the right-face in isometric view)
  // The front face is at z = -1 + 2 = +1 (the max-Z face, which faces the camera).
  // In our isometric projection, the "front-left" face (visible left face) is at z=d side.
  // We place eyes on the right face (x+w side) which is the front-right face facing camera.
  // Actually for our projection the VISIBLE faces are:
  //   Left face: z = z+d plane (bottom-left on screen)
  //   Right face: x = x+w plane (bottom-right on screen)
  //   Top face: y = y+h plane (top)
  // Eyes should go on the LEFT visible face (z+d plane) since that's what faces the viewer.

  // Left visible face spans: x from -1 to +1, y from 7 to 9, at z=+1
  // Eye sockets: two small dark squares on this face
  const eyeZ = 1.02 // slightly in front of face
  const eyeY = 7.8  // vertical center of eyes

  svg += '\n<g id="eyes">'
  // Left eye (screen-left = lower X in iso)
  svg += `\n  <polygon points="${pt(-0.7, eyeY, eyeZ)} ${pt(-0.1, eyeY, eyeZ)} ${pt(-0.1, eyeY + 0.6, eyeZ)} ${pt(-0.7, eyeY + 0.6, eyeZ)}" fill="#0d0d2b" />`
  // Right eye (screen-right = higher X in iso)
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

  // ── Painter's algorithm: back → front ──
  // In our isometric view (looking from +X,+Z towards origin),
  // high-X parts and low-Z parts are "behind" and should render first.

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

  // 7. Weapon (if equipped — rendered after head, in right arm area)
  if (weaponSvg) {
    const weaponPos = isoToScreen(1.8, 4, 0) // right arm position
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
