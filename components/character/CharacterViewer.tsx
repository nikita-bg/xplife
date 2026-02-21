/**
 * CharacterViewer — Zone wrapper + cursor tracking orchestrator.
 * Wraps CharacterSVG in an interaction zone and wires up the tracking hook.
 */

'use client'

import React, { useRef } from 'react'
import CharacterSVG, {
  CharacterErrorBoundary,
  type CharacterSVGHandle,
} from './CharacterSVG'
import { useCharacterTracking } from './useCharacterTracking'
import type { CharacterConfig, CharacterPart } from './CharacterConfig'

interface CharacterViewerProps {
  config: CharacterConfig
  registry?: CharacterPart[]
  className?: string
}

/**
 * Full character viewer with cursor interaction zone.
 * Tracks mouse position when cursor enters this component's bounding box.
 * Smoothly returns to idle when cursor leaves.
 */
export default function CharacterViewer({
  config,
  registry = [],
  className = '',
}: CharacterViewerProps) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<CharacterSVGHandle>(null)

  useCharacterTracking({
    zoneRef,
    svgRootRef: {
      get current() {
        return characterRef.current?.svgRootRef.current ?? null
      },
    },
    pupilsRef: {
      get current() {
        return characterRef.current?.pupilsRef.current ?? null
      },
    },
    eyesRef: {
      get current() {
        return characterRef.current?.eyesRef.current ?? null
      },
    },
    enabled: true,
  })

  return (
    <div
      ref={zoneRef}
      className={`relative select-none ${className}`}
      style={{ cursor: 'crosshair' }}
    >
      {/* Idle float keyframes */}
      <style>{`
        @keyframes character-idle-float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
      `}</style>
      <CharacterErrorBoundary>
        <CharacterSVG
          ref={characterRef}
          config={config}
          registry={registry}
          className="w-full h-full"
        />
      </CharacterErrorBoundary>
    </div>
  )
}
