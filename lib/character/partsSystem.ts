/**
 * Character parts assembly engine.
 * Builds complete SVG strings from modular parts and configuration.
 * Uses the same isometric projection as generate_svgs.js.
 */

import type {
  CharacterConfig,
  CharacterPart,
  PartType,
} from '@/components/character/CharacterConfig'
import { ALL_PART_TYPES } from '@/components/character/CharacterConfig'
import { getRankConfig, isRankAtLeast } from './rankColors'

// ─── Isometric Projection (mirrors generate_svgs.js) ────────────────────────

const SX = 4
const SY = 2
const SZ = 4

function proj(x: number, y: number, z: number): string {
  const px = 100 + (x - z) * SX
  const py = 210 + (x + z) * SY - y * SZ
  return `${px},${py}`
}

function adjustColor(hex: string, amount: number): string {
  return (
    '#' +
    hex
      .replace(/^#/, '')
      .replace(/../g, (c) =>
        (
          '0' +
          Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)
        ).slice(-2)
      )
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Draw an isometric cuboid block */
function drawBlock(
  id: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  baseColor: string
): string {
  const topColor = adjustColor(baseColor, 40)
  const leftColor = baseColor
  const rightColor = adjustColor(baseColor, -40)

  const pTop = `${proj(x, y + h, z)} ${proj(x + w, y + h, z)} ${proj(x + w, y + h, z + d)} ${proj(x, y + h, z + d)}`
  const pRight = `${proj(x + w, y, z)} ${proj(x + w, y, z + d)} ${proj(x + w, y + h, z + d)} ${proj(x + w, y + h, z)}`
  const pLeft = `${proj(x, y, z + d)} ${proj(x + w, y, z + d)} ${proj(x + w, y + h, z + d)} ${proj(x, y + h, z + d)}`

  let out = `<g id="${id}">\n`
  out += `  <polygon points="${pLeft}" fill="${leftColor}" stroke="${adjustColor(leftColor, -20)}" stroke-width="0.5" stroke-linejoin="round"/>\n`
  out += `  <polygon points="${pRight}" fill="${rightColor}" stroke="${adjustColor(rightColor, -20)}" stroke-width="0.5" stroke-linejoin="round"/>\n`
  out += `  <polygon points="${pTop}" fill="${topColor}" stroke="${adjustColor(topColor, -20)}" stroke-width="0.5" stroke-linejoin="round"/>\n`
  out += `</g>\n`
  return out
}

// ─── Part Generators ────────────────────────────────────────────────────────

function generateHead(primary: string, accent: string, rankColor: string, filterId: string): string {
  let svg = `<g id="head">\n`
  svg += drawBlock('head-base', -4, 24, -4, 8, 8, 8, primary)
  svg += drawBlock('head-trim', -4.1, 30, -4.1, 8.2, 2.2, 8.2, rankColor)

  // Eyes
  const ex = -4
  const ey = 27
  const ez = 4
  svg += `<g id="eyes">\n`
  svg += `  <polygon points="${proj(ex + 1, ey, ez)} ${proj(ex + 3, ey, ez)} ${proj(ex + 3, ey + 1.5, ez)} ${proj(ex + 1, ey + 1.5, ez)}" fill="#0d0d2b" />\n`
  svg += `  <polygon points="${proj(ex + 5, ey, ez)} ${proj(ex + 7, ey, ez)} ${proj(ex + 7, ey + 1.5, ez)} ${proj(ex + 5, ey + 1.5, ez)}" fill="#0d0d2b" />\n`
  svg += `</g>\n`

  // Pupils (tracked by cursor)
  svg += `<g id="pupils" class="pupils-track">\n`
  svg += `  <polygon points="${proj(ex + 1.5, ey + 0.5, ez + 0.1)} ${proj(ex + 2.5, ey + 0.5, ez + 0.1)} ${proj(ex + 2.5, ey + 1, ez + 0.1)} ${proj(ex + 1.5, ey + 1, ez + 0.1)}" fill="${accent}" filter="url(#${filterId})"/>\n`
  svg += `  <polygon points="${proj(ex + 5.5, ey + 0.5, ez + 0.1)} ${proj(ex + 6.5, ey + 0.5, ez + 0.1)} ${proj(ex + 6.5, ey + 1, ez + 0.1)} ${proj(ex + 5.5, ey + 1, ez + 0.1)}" fill="${accent}" filter="url(#${filterId})"/>\n`
  svg += `</g>\n`

  svg += `</g>\n`
  return svg
}

function generateBody(primary: string, accent: string, rankColor: string): string {
  let svg = `<g id="body">\n`
  svg += drawBlock('body-base', -4, 12, -2, 8, 12, 4, primary)
  svg += drawBlock('body-accent', -2, 16, -2.1, 4, 4, 4.2, accent)
  svg += drawBlock('body-trim', -4, 12, -2.2, 8.2, 2, 4.4, rankColor)
  svg += `</g>\n`
  return svg
}

function generateRightArm(primary: string, rankColor: string): string {
  let svg = `<g id="right-arm">\n`
  svg += drawBlock('right-arm-base', 4, 12, -2, 4, 12, 4, primary)
  svg += drawBlock('right-arm-trim', 4, 12, -2.1, 4.1, 2, 4.2, rankColor)
  svg += `</g>\n`
  return svg
}

function generateLeftArm(primary: string, rankColor: string): string {
  let svg = `<g id="left-arm">\n`
  svg += drawBlock('left-arm-base', -8, 12, -2, 4, 12, 4, primary)
  svg += drawBlock('left-arm-trim', -8.1, 12, -2.1, 4.2, 2, 4.2, rankColor)
  svg += `</g>\n`
  return svg
}

function generateRightLeg(primary: string, rankColor: string): string {
  let svg = `<g id="right-leg">\n`
  svg += drawBlock('right-leg-base', 0, 0, -2, 4, 12, 4, primary)
  svg += drawBlock('right-leg-trim', 0, 0, -2.1, 4.1, 3, 4.2, rankColor)
  svg += `</g>\n`
  return svg
}

function generateLeftLeg(primary: string, rankColor: string): string {
  let svg = `<g id="left-leg">\n`
  svg += drawBlock('left-leg-base', -4, 0, -2, 4, 12, 4, primary)
  svg += drawBlock('left-leg-trim', -4, 0, -2.1, 4.1, 3, 4.2, rankColor)
  svg += `</g>\n`
  return svg
}

function generateBasePlate(glowColor: string, rankColor: string, filterId: string): string {
  const basew = 24
  const based = 24
  const baseh = 2
  const bx = -basew / 2
  const bz = -based / 2
  const by = -baseh

  let svg = `<g id="isometric-base-plate" filter="url(#${filterId})">\n`
  svg += drawBlock('base-plate', bx, by, bz, basew, baseh, based, '#1a1a2e')
  svg += `  <polygon points="${proj(bx, by + baseh, bz)} ${proj(bx + basew, by + baseh, bz)} ${proj(bx + basew, by + baseh, bz + based)} ${proj(bx, by + baseh, bz + based)}" fill="${glowColor}" opacity="0.4" />\n`
  svg += `  <polygon points="${proj(bx + 2, by + baseh + 0.1, bz + 2)} ${proj(bx + basew - 2, by + baseh + 0.1, bz + 2)} ${proj(bx + basew - 2, by + baseh + 0.1, bz + based - 2)} ${proj(bx + 2, by + baseh + 0.1, bz + based - 2)}" fill="none" stroke="${rankColor}" stroke-width="1.5" />\n`
  svg += `</g>\n`
  return svg
}

// ─── Fallback SVG ───────────────────────────────────────────────────────────

/** Simple humanoid silhouette used as error fallback */
export const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
  <g transform="translate(100, 150)">
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
 * If a parts registry is provided, it uses custom SVG content for matching parts.
 * Otherwise, generates the default isometric character.
 */
export function assembleCharacter(
  config: CharacterConfig,
  registry: CharacterPart[] = []
): string {
  const { colors } = config
  const { primary, accent, rankColor, glowColor } = colors
  const filterId = `glow-${config.userId ?? 'char'}`

  // Build registry lookup
  const registryMap = new Map<string, CharacterPart>()
  for (const part of registry) {
    registryMap.set(part.id, part)
  }

  // Check if any custom parts are specified
  const hasCustomParts = Object.values(config.parts).some((partId) =>
    registryMap.has(partId)
  )

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">\n`
  svg += `<defs>\n`
  svg += `  <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">\n`
  svg += `    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>\n`
  svg += `    <feMerge>\n`
  svg += `      <feMergeNode in="coloredBlur"/>\n`
  svg += `      <feMergeNode in="SourceGraphic"/>\n`
  svg += `    </feMerge>\n`
  svg += `  </filter>\n`
  svg += `</defs>\n`

  // Base plate
  svg += generateBasePlate(glowColor, rankColor, filterId)

  // Character root
  svg += `<g id="character-root" class="character-idle" style="transform-origin: center;">\n`

  if (hasCustomParts) {
    // Use custom SVG content from registry where available
    const partOrder: PartType[] = [
      'rightArm',
      'rightLeg',
      'leftLeg',
      'body',
      'head',
      'leftArm',
    ]
    for (const partType of partOrder) {
      const partId = config.parts[partType]
      const customPart = registryMap.get(partId)
      if (customPart) {
        svg += customPart.svgContent + '\n'
      } else {
        svg += generatePartDefault(partType, primary, accent, rankColor, filterId)
      }
    }
  } else {
    // Draw order (back to front): Right Arm, Right Leg, Left Leg, Body, Head, Left Arm
    svg += generateRightArm(primary, rankColor)
    svg += generateRightLeg(primary, rankColor)
    svg += generateLeftLeg(primary, rankColor)
    svg += generateBody(primary, accent, rankColor)
    svg += generateHead(primary, accent, rankColor, filterId)
    svg += generateLeftArm(primary, rankColor)
  }

  svg += `</g>\n`
  svg += `</svg>`

  return svg
}

/** Generate a single default part by type */
function generatePartDefault(
  partType: PartType,
  primary: string,
  accent: string,
  rankColor: string,
  filterId: string
): string {
  switch (partType) {
    case 'head':
      return generateHead(primary, accent, rankColor, filterId)
    case 'body':
      return generateBody(primary, accent, rankColor)
    case 'leftArm':
      return generateLeftArm(primary, rankColor)
    case 'rightArm':
      return generateRightArm(primary, rankColor)
    case 'leftLeg':
      return generateLeftLeg(primary, rankColor)
    case 'rightLeg':
      return generateRightLeg(primary, rankColor)
  }
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
 * Useful for populating a new character config.
 */
export function getDefaultParts(): Record<PartType, string> {
  const parts: Partial<Record<PartType, string>> = {}
  for (const partType of ALL_PART_TYPES) {
    parts[partType] = `base-${partType}`
  }
  return parts as Record<PartType, string>
}
