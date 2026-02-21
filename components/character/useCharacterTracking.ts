/**
 * Custom hook: cursor tracking, eye following, body tilt, idle animations.
 * All animation state lives in refs — zero React re-renders in the rAF loop.
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { TrackingState, CachedMeasurements } from './CharacterConfig'
import {
  MAX_PUPIL_TRAVEL_X,
  MAX_PUPIL_TRAVEL_Y,
  PUPIL_LERP_FACTOR,
  TILT_LERP_FACTOR,
  MAX_TILT_X,
  MAX_TILT_Y,
  RETURN_LERP_FACTOR,
  BLINK_MIN_INTERVAL,
  BLINK_MAX_INTERVAL,
} from './CharacterConfig'

/** Linear interpolation */
function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor
}

/** Check if value is close enough to target to stop lerping */
function isNearZero(value: number, threshold: number = 0.01): boolean {
  return Math.abs(value) < threshold
}

export interface UseCharacterTrackingOptions {
  /** Ref to the zone wrapper element (CharacterViewer div) */
  zoneRef: React.RefObject<HTMLDivElement | null>
  /** Ref to the SVG root element */
  svgRootRef: React.RefObject<SVGSVGElement | null>
  /** Ref to the pupils <g> element */
  pupilsRef: React.RefObject<SVGGElement | null>
  /** Ref to the eyes <g> element (for blinking) */
  eyesRef: React.RefObject<SVGGElement | null>
  /** Whether tracking is enabled */
  enabled?: boolean
}

/**
 * Provides smooth cursor-following eye tracking, subtle body tilt,
 * idle floating animation, and lazy eye blinks.
 *
 * All DOM mutations happen via direct ref manipulation inside a
 * requestAnimationFrame loop — no React state updates.
 */
export function useCharacterTracking({
  zoneRef,
  svgRootRef,
  pupilsRef,
  eyesRef,
  enabled = true,
}: UseCharacterTrackingOptions): void {
  const rafRef = useRef<number>(0)
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trackingState = useRef<TrackingState>({
    isActive: false,
    cursorX: 0,
    cursorY: 0,
    pupilX: 0,
    pupilY: 0,
    tiltX: 0,
    tiltY: 0,
  })

  const measurements = useRef<CachedMeasurements>({
    charCenterX: 0,
    charCenterY: 0,
    zoneLeft: 0,
    zoneTop: 0,
    zoneRight: 0,
    zoneBottom: 0,
    windowWidth: 1,
    windowHeight: 1,
  })

  /** Recalculate cached bounding measurements */
  const updateMeasurements = useCallback(() => {
    const zone = zoneRef.current
    const svg = svgRootRef.current
    if (!zone || !svg) return

    const zoneRect = zone.getBoundingClientRect()
    const svgRect = svg.getBoundingClientRect()

    measurements.current = {
      charCenterX: svgRect.left + svgRect.width / 2,
      charCenterY: svgRect.top + svgRect.height / 2,
      zoneLeft: zoneRect.left,
      zoneTop: zoneRect.top,
      zoneRight: zoneRect.right,
      zoneBottom: zoneRect.bottom,
      windowWidth: Math.max(window.innerWidth, 1),
      windowHeight: Math.max(window.innerHeight, 1),
    }
  }, [zoneRef, svgRootRef])

  /** Schedule the next idle blink at a random interval */
  const scheduleBlink = useCallback(() => {
    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current)
    }
    const delay =
      BLINK_MIN_INTERVAL +
      Math.random() * (BLINK_MAX_INTERVAL - BLINK_MIN_INTERVAL)
    blinkTimeoutRef.current = setTimeout(() => {
      const eyes = eyesRef.current
      if (!eyes || trackingState.current.isActive) {
        scheduleBlink()
        return
      }
      // Blink animation: scale Y to 0.05 then back to 1
      eyes.style.transition = 'transform 0.08s ease-in'
      eyes.style.transformOrigin = 'center'
      eyes.style.transform = 'scaleY(0.05)'
      setTimeout(() => {
        eyes.style.transition = 'transform 0.12s ease-out'
        eyes.style.transform = 'scaleY(1)'
        scheduleBlink()
      }, 100)
    }, delay)
  }, [eyesRef])

  /** The core animation tick — runs every frame */
  const tick = useCallback(() => {
    const state = trackingState.current
    const meas = measurements.current
    const pupils = pupilsRef.current
    const svgRoot = svgRootRef.current

    if (state.isActive) {
      // ── Eye tracking ──
      const dx = state.cursorX - meas.charCenterX
      const dy = state.cursorY - meas.charCenterY
      const angle = Math.atan2(dy, dx)
      const rawDistance = Math.hypot(dx, dy)

      const maxTravel = Math.min(MAX_PUPIL_TRAVEL_X, rawDistance * 0.08)
      const targetPupilX = Math.cos(angle) * Math.min(MAX_PUPIL_TRAVEL_X, maxTravel)
      const targetPupilY = Math.sin(angle) * Math.min(MAX_PUPIL_TRAVEL_Y, maxTravel)

      state.pupilX = lerp(state.pupilX, targetPupilX, PUPIL_LERP_FACTOR)
      state.pupilY = lerp(state.pupilY, targetPupilY, PUPIL_LERP_FACTOR)

      // ── Body tilt ──
      const targetTiltX = (dy / meas.windowHeight) * -MAX_TILT_X
      const targetTiltY = (dx / meas.windowWidth) * MAX_TILT_Y

      state.tiltX = lerp(state.tiltX, targetTiltX, TILT_LERP_FACTOR)
      state.tiltY = lerp(state.tiltY, targetTiltY, TILT_LERP_FACTOR)
    } else {
      // ── Return to neutral ──
      state.pupilX = lerp(state.pupilX, 0, RETURN_LERP_FACTOR)
      state.pupilY = lerp(state.pupilY, 0, RETURN_LERP_FACTOR)
      state.tiltX = lerp(state.tiltX, 0, RETURN_LERP_FACTOR)
      state.tiltY = lerp(state.tiltY, 0, RETURN_LERP_FACTOR)

      // Snap to zero when close enough
      if (isNearZero(state.pupilX) && isNearZero(state.pupilY)) {
        state.pupilX = 0
        state.pupilY = 0
      }
      if (isNearZero(state.tiltX) && isNearZero(state.tiltY)) {
        state.tiltX = 0
        state.tiltY = 0
      }
    }

    // ── Apply transforms via direct DOM manipulation ──
    if (pupils) {
      pupils.style.transform = `translate(${state.pupilX}px, ${state.pupilY}px)`
    }
    if (svgRoot) {
      svgRoot.style.transform = `perspective(800px) rotateX(${state.tiltX}deg) rotateY(${state.tiltY}deg)`
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [pupilsRef, svgRootRef])

  // ── Event handlers ──

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      trackingState.current.cursorX = event.clientX
      trackingState.current.cursorY = event.clientY
    },
    []
  )

  const handleMouseEnter = useCallback(() => {
    trackingState.current.isActive = true
    updateMeasurements()
  }, [updateMeasurements])

  const handleMouseLeave = useCallback(() => {
    trackingState.current.isActive = false
  }, [])

  const handleResize = useCallback(() => {
    updateMeasurements()
  }, [updateMeasurements])

  // ── Lifecycle ──

  useEffect(() => {
    if (!enabled) return

    const zone = zoneRef.current
    if (!zone) return

    // Initial measurements
    updateMeasurements()

    // Start rAF loop
    rafRef.current = requestAnimationFrame(tick)

    // Start idle blink cycle
    scheduleBlink()

    // Attach event listeners
    zone.addEventListener('mouseenter', handleMouseEnter)
    zone.addEventListener('mouseleave', handleMouseLeave)
    zone.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
      }
      zone.removeEventListener('mouseenter', handleMouseEnter)
      zone.removeEventListener('mouseleave', handleMouseLeave)
      zone.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [
    enabled,
    zoneRef,
    tick,
    scheduleBlink,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
    handleResize,
    updateMeasurements,
  ])
}
