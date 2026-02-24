---
name: 3D Avatar & Items System
description: Use when creating, rendering, or animating 3D avatars, character items, inventory items, or 3D scenes in the XPLife app. Provides patterns for Three.js, React Three Fiber, GLTF models, isometric sprites, and WebGL-based graphics for the gamification system.
---

# 3D Avatar & Items Skill for XPLife

Use this skill for any 3D avatar, item, or scene work in the XPLife gamification app.

## Recommended Stack

For XPLife's web-based 3D system, use:

| Tool | Purpose |
|------|---------|
| **React Three Fiber (R3F)** | React-friendly Three.js wrapper — best for Next.js |
| **@react-three/drei** | R3F helpers: OrbitControls, useGLTF, Environment, etc. |
| **@react-three/postprocessing** | Bloom, glow, chromatic aberration for cyberpunk look |
| **Three.js** | Core 3D engine |
| **Spline** | Design 3D models in browser, export to React |
| **Sketchfab** | Free GLTF model library |

## Installation

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

## XPLife Avatar Architecture

### Character Structure (GLTF/JSON)
```typescript
interface XPLifeCharacter {
  class: 'Adventurer' | 'Thinker' | 'Guardian' | 'Connector';
  rank: 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Mythic';
  parts: {
    body: string;      // GLTF path or color
    head: string;
    weapon: string;
    armor: string;
    cape?: string;
    aura?: string;     // Mythic rank glow effect
  };
  colors: {
    primary: string;
    secondary: string; 
    accent: string;
  };
}
```

### Rank Color Mapping
| Rank | Color | Effect |
|------|-------|--------|
| Iron | `#8C9099` | None |
| Bronze | `#CD7F32` | Subtle glow |
| Silver | `#C0C0C0` | Metallic shimmer |
| Gold | `#FFD700` | Gold glow |
| Platinum | `#E5E4E2` | Ice shimmer |
| Diamond | `#B9F2FF` | Crystal sparkle |
| Master | `#9B4EDD` | Purple aura |
| Grandmaster | `#FF6B35` | Fire aura |
| Mythic | `#00F5FF` | Full neon aura + particles |

## Basic React Three Fiber Setup

```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Avatar({ modelPath, rank }: { modelPath: string; rank: string }) {
  const { scene } = useGLTF(modelPath);
  return (
    <primitive 
      object={scene} 
      scale={1.5}
      position={[0, -1, 0]}
    />
  );
}

export function AvatarViewer({ rank = 'Iron' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#00F5FF" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#FFB800" intensity={1} />
      
      <Avatar modelPath="/models/avatar-iron.glb" rank={rank} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      <Environment preset="night" />
      
      {/* Cyberpunk glow for high ranks */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
```

## Isometric Sprite Alternative

For performance-friendly avatars (no 3D model needed), use CSS isometric SVG sprites:

```tsx
// Isometric character using pure SVG/CSS
export function IsometricAvatar({ class: charClass, rank }: CharacterProps) {
  const rankColor = RANK_COLORS[rank];
  return (
    <div className="isometric-character" style={{ '--rank-color': rankColor }}>
      <svg viewBox="0 0 100 120">
        {/* Body */}
        <ellipse cx="50" cy="80" rx="20" ry="10" fill={rankColor} opacity="0.3"/>
        {/* Torso */}
        <rect x="35" y="50" width="30" height="35" rx="5" fill={rankColor}/>
        {/* Head */}
        <circle cx="50" cy="40" r="16" fill="#E8E6F0"/>
        {/* Class icon */}
        <text x="50" y="85" textAnchor="middle" fontSize="10" fill="#080B1A">
          {CLASS_ICONS[charClass]}
        </text>
      </svg>
    </div>
  );
}
```

## Item System

```typescript
interface XPLifeItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'cosmetic' | 'consumable';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  model?: string;    // GLTF path
  sprite?: string;   // 2D sprite path
  stats?: Record<string, number>;
}

// Rarity border colors (use in inventory UI)
const RARITY_COLORS = {
  Common: '#9CA3AF',
  Uncommon: '#22C55E', 
  Rare: '#3B82F6',
  Epic: '#9B4EDD',
  Legendary: '#FFB800',
  Mythic: '#00F5FF',   // + shimmer animation
};
```

## Performance Tips

1. **Use GLTF compressed** — `npm install gltf-pipeline` to compress models
2. **LOD system** — Show simple mesh far away, detailed up close
3. **Lazy load Canvas** — Only mount `<Canvas>` when visible
4. **Sprite fallback** — Use 2D sprites on low-end devices
5. **Bake lighting** — Pre-bake lights into textures for performance

## Cyberpunk Shader for Mythic Rank

```glsl
// vertex shader snippet for aura effect
varying vec2 vUv;
uniform float time;

void main() {
  vUv = uv;
  vec3 pos = position;
  pos += normal * sin(time * 2.0 + position.y * 5.0) * 0.02;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

## Free 3D Asset Sources

- **Sketchfab** — sketchfab.com (GLTF format)
- **Mixamo** — mixamo.com (animated characters)
- **Ready Player Me** — readyplayer.me (customizable avatars)
- **Spline** — spline.design (design in browser)
- **KayKit** — kaylousberg.itch.io (game-ready assets)
