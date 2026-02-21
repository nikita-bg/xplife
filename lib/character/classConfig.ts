/**
 * Character class definitions and their associated color schemes.
 * Maps to Braverman neurotransmitter personality types.
 */

import type { ClassType } from '@/components/character/CharacterConfig'

export interface ClassConfig {
  label: string
  description: string
  neurotransmitter: string
  primary: string
  accent: string
}

/** Full class configuration — matches the generate_svgs.js CLASSES object */
export const CLASS_CONFIG: Record<ClassType, ClassConfig> = {
  adventurer: {
    label: 'Adventurer',
    description: 'Bold challenges, excitement, and novelty',
    neurotransmitter: 'Dopamine',
    primary: '#FF4500',
    accent: '#FFD700',
  },
  thinker: {
    label: 'Thinker',
    description: 'Deep focus, learning, and creativity',
    neurotransmitter: 'Acetylcholine',
    primary: '#00BFFF',
    accent: '#E0F4FF',
  },
  guardian: {
    label: 'Guardian',
    description: 'Stability, consistency, and inner peace',
    neurotransmitter: 'GABA',
    primary: '#00C896',
    accent: '#A0AEC0',
  },
  connector: {
    label: 'Connector',
    description: 'Relationships, community, and connections',
    neurotransmitter: 'Serotonin',
    primary: '#C77DFF',
    accent: '#FFD166',
  },
}

/** All class types as an array */
export const ALL_CLASSES: ClassType[] = ['adventurer', 'thinker', 'guardian', 'connector']

/**
 * Get class config by type. Falls back to 'adventurer' if invalid.
 */
export function getClassConfig(classType: ClassType): ClassConfig {
  return CLASS_CONFIG[classType] ?? CLASS_CONFIG.adventurer
}
