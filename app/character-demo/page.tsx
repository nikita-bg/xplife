/**
 * Character Demo Page — full viewport layout with interactive character viewer.
 * Layout: Left sidebar (tasks), Center (character), Right sidebar (quests), Bottom (input bar).
 */

'use client'

import React, { useState, useMemo } from 'react'
import CharacterViewer from '@/components/character/CharacterViewer'
import type { CharacterConfig, ClassType, RankTier } from '@/components/character/CharacterConfig'
import { DEFAULT_PARTS } from '@/components/character/CharacterConfig'
import { CLASS_CONFIG, ALL_CLASSES } from '@/lib/character/classConfig'
import { RANK_CONFIG, RANK_TIERS_SORTED } from '@/lib/character/rankColors'

export default function CharacterDemoPage() {
  const [selectedClass, setSelectedClass] = useState<ClassType>('adventurer')
  const [selectedRank, setSelectedRank] = useState<RankTier>('iron')

  const config: CharacterConfig = useMemo(() => {
    const classColors = CLASS_CONFIG[selectedClass]
    const rankConfig = RANK_CONFIG[selectedRank]

    return {
      class: selectedClass,
      rank: selectedRank,
      parts: { ...DEFAULT_PARTS },
      colors: {
        primary: classColors.primary,
        accent: classColors.accent,
        rankColor: rankConfig.color,
        glowColor: rankConfig.glow,
      },
    }
  }, [selectedClass, selectedRank])

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a] text-white overflow-hidden font-sans">
      {/* Top bar — Class & Rank selectors */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 shrink-0">
        {/* Class selector */}
        <div className="flex gap-2">
          {ALL_CLASSES.map((cls) => {
            const classInfo = CLASS_CONFIG[cls]
            const isActive = selectedClass === cls
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? classInfo.primary : '#1a1a2e',
                  color: isActive ? '#fff' : '#888',
                  border: `2px solid ${isActive ? classInfo.primary : '#2a2a3e'}`,
                  boxShadow: isActive
                    ? `0 0 16px ${classInfo.primary}40`
                    : 'none',
                }}
              >
                {classInfo.label}
              </button>
            )
          })}
        </div>

        {/* Rank selector */}
        <select
          value={selectedRank}
          onChange={(e) => setSelectedRank(e.target.value as RankTier)}
          className="ml-4 px-3 py-2 rounded-lg text-sm font-medium bg-[#1a1a2e] border border-[#2a2a3e] text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {RANK_TIERS_SORTED.map((tier) => {
            const rankInfo = RANK_CONFIG[tier]
            return (
              <option key={tier} value={tier}>
                {rankInfo.label}
              </option>
            )
          })}
        </select>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 gap-4 px-4">
        {/* Left sidebar — Tasks */}
        <div className="flex flex-col gap-3 justify-center w-48 shrink-0">
          {['Task 1', 'Task 2', 'Task 3'].map((label) => (
            <button
              key={label}
              className="px-6 py-4 rounded-2xl text-sm font-medium bg-[#1a1a2e] border border-[#2a2a3e] text-[#888] hover:border-purple-500/50 hover:text-white transition-all duration-200"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Center — Character Viewer */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div
            className="w-full max-w-lg aspect-square rounded-3xl border border-[#2a2a3e] bg-[#0d0d1a]/80 backdrop-blur-sm overflow-hidden"
            style={{
              boxShadow: `0 0 40px ${config.colors.glowColor}, inset 0 0 60px ${config.colors.primary}10`,
            }}
          >
            <CharacterViewer
              config={config}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Right sidebar — Questionnaires */}
        <div className="flex flex-col gap-3 justify-center w-48 shrink-0">
          {['Q1', 'Q2', 'Q3'].map((label) => (
            <button
              key={label}
              className="px-6 py-4 rounded-2xl text-sm font-medium bg-[#1a1a2e] border border-[#2a2a3e] text-[#888] hover:border-cyan-500/50 hover:text-white transition-all duration-200"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom — Input bar placeholder */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="w-full h-20 rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] flex items-center px-6">
          <span className="text-[#555] text-sm">
            Type a command or ask your AI quest advisor...
          </span>
        </div>
      </div>
    </div>
  )
}
