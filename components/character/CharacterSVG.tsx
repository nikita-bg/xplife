/**
 * CharacterSVG — SVG renderer with dynamic part injection.
 * Applies CSS custom properties, glow filters, and exposes refs
 * for the tracking hook.
 */

'use client'

import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import type { CharacterConfig } from './CharacterConfig'
import { assembleCharacter, FALLBACK_SVG } from '@/lib/character/partsSystem'
import type { CharacterPart } from './CharacterConfig'

export interface CharacterSVGHandle {
  svgRootRef: React.RefObject<SVGSVGElement | null>
  pupilsRef: React.RefObject<SVGGElement | null>
  eyesRef: React.RefObject<SVGGElement | null>
}

interface CharacterSVGProps {
  config: CharacterConfig
  registry?: CharacterPart[]
  className?: string
}

/**
 * Renders the assembled character SVG with CSS custom properties,
 * glow filter, and halo background. Exposes element refs via imperative handle.
 */
const CharacterSVG = forwardRef<CharacterSVGHandle, CharacterSVGProps>(
  function CharacterSVG({ config, registry = [], className = '' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const svgRootRef = useRef<SVGSVGElement | null>(null)
    const pupilsRef = useRef<SVGGElement | null>(null)
    const eyesRef = useRef<SVGGElement | null>(null)

    useImperativeHandle(ref, () => ({
      svgRootRef,
      pupilsRef,
      eyesRef,
    }))

    // Assemble SVG content (memoized)
    const svgContent = useMemo(() => {
      try {
        return assembleCharacter(config, registry)
      } catch {
        return FALLBACK_SVG
      }
    }, [config, registry])

    // Capture refs from injected SVG
    const captureRefs = useCallback(() => {
      const container = containerRef.current
      if (!container) return

      const svg = container.querySelector('svg')
      if (svg) {
        svgRootRef.current = svg as unknown as SVGSVGElement

        const charRoot = svg.querySelector('#character-root') as SVGGElement | null
        if (charRoot) {
          // Apply idle float animation via CSS
          charRoot.style.animation = 'character-idle-float 3s ease-in-out infinite'
          charRoot.style.transformOrigin = 'center'
        }
      }

      const pupils = container.querySelector('#pupils') as SVGGElement | null
      if (pupils) {
        pupilsRef.current = pupils
      }

      const eyes = container.querySelector('#eyes') as SVGGElement | null
      if (eyes) {
        eyesRef.current = eyes
      }
    }, [])

    useEffect(() => {
      captureRefs()
    }, [svgContent, captureRefs])

    const cssVars = {
      '--char-primary': config.colors.primary,
      '--char-accent': config.colors.accent,
      '--char-rank': config.colors.rankColor,
      '--char-glow': config.colors.glowColor,
    } as React.CSSProperties

    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={cssVars}
      >
        {/* Halo background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center, ${config.colors.primary}25 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        {/* SVG container */}
        <div
          ref={containerRef}
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={{
            filter: `drop-shadow(0 0 12px ${config.colors.glowColor})`,
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    )
  }
)

export default CharacterSVG

// ─── Error Boundary ─────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean
}

export class CharacterErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center w-full h-full"
          dangerouslySetInnerHTML={{ __html: FALLBACK_SVG }}
        />
      )
    }
    return this.props.children
  }
}
