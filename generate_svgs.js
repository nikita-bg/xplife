const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'public', 'character-system');

// Ensure dirs exist
['', 'classes', 'ranks', 'ranks/adventurer'].forEach(d => {
    const p = path.join(DIR, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Hex color darkener utility
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Isometric Projection
const SX = 4;
const SY = 2; // 2:1 ratio for isometric games
const SZ = 4; // Height multiplier

function proj(x, y, z) {
    const px = 100 + (x - z) * SX;
    const py = 210 + (x + z) * SY - y * SZ;
    return `${px},${py}`;
}

// Draw a cuboid (block)
// We only draw visible faces from the isometric angle: Top, Right(Front-Right), Left(Front-Left)
// X is bottom-right, Z is bottom-left, Y is Up
function drawBlock(id, x, y, z, w, h, d, baseColor, isTrim = false, innerClass = '') {
    const topColor = adjustColor(baseColor, 40);
    const leftColor = baseColor;
    const rightColor = adjustColor(baseColor, -40);

    // Top Face
    const pTop = `${proj(x, y + h, z)} ${proj(x + w, y + h, z)} ${proj(x + w, y + h, z + d)} ${proj(x, y + h, z + d)}`;

    // Left/Front Face (facing towards +Z direction visually, wait, X is right, Z is left)
    // X axis expands to bottom-right, Z axis expands to bottom-left
    // So the left visible face is the X=0 plane (if we look from high Z? No, we look from -X, -Z towards origin)
    // Let's standardise: x goes right-down, z goes left-down. We see +x and +z faces.
    const pRight = `${proj(x + w, y, z)} ${proj(x + w, y, z + d)} ${proj(x + w, y + h, z + d)} ${proj(x + w, y + h, z)}`;
    const pLeft = `${proj(x, y, z + d)} ${proj(x + w, y, z + d)} ${proj(x + w, y + h, z + d)} ${proj(x, y + h, z + d)}`;

    let out = `<g id="${id}" class="${innerClass}">\n`;
    out += `  <polygon points="${pLeft}" fill="${leftColor}" stroke="${adjustColor(leftColor, -20)}" stroke-width="0.5" stroke-linejoin="round"/>\n`;
    out += `  <polygon points="${pRight}" fill="${rightColor}" stroke="${adjustColor(rightColor, -20)}" stroke-width="0.5" stroke-linejoin="round"/>\n`;
    out += `  <polygon points="${pTop}" fill="${topColor}" stroke="${adjustColor(topColor, -20)}" stroke-width="0.5" stroke-linejoin="round"/>\n`;

    // Draw trim if rank requires it
    if (isTrim) {
        // A smaller polygon or overlay for trim
        // We will just do a secondary color stroke for simplicity or use it later
    }

    out += `</g>\n`;
    return out;
}

// Generate the full character SVG
function createCharacterSvg(config) {
    const { id, primary, accent, rankColor = '#888888', glowColor = 'rgba(0,0,0,0)', basePlate = false, rankName = 'iron', className = 'adventurer' } = config;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">\n`;
    svg += `<defs>
    <filter id="glow-${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>\n`;

    // Base Plate
    if (basePlate) {
        const basew = 24, based = 24, baseh = 2;
        const bx = -basew / 2, bz = -based / 2, by = -baseh;
        svg += `<g id="isometric-base-plate" filter="url(#glow-${id})">`;
        svg += drawBlock('base-plate', bx, by, bz, basew, baseh, based, '#1a1a2e');
        // Base glow layer
        svg += `<polygon points="${proj(bx, by + baseh, bz)} ${proj(bx + basew, by + baseh, bz)} ${proj(bx + basew, by + baseh, bz + based)} ${proj(bx, by + baseh, bz + based)}" fill="${glowColor}" opacity="0.4" />`;
        // Rank trim on base plate
        svg += `<polygon points="${proj(bx + 2, by + baseh + 0.1, bz + 2)} ${proj(bx + basew - 2, by + baseh + 0.1, bz + 2)} ${proj(bx + basew - 2, by + baseh + 0.1, bz + based - 2)} ${proj(bx + 2, by + baseh + 0.1, bz + based - 2)}" fill="none" stroke="${rankColor}" stroke-width="1.5" />`;
        svg += `</g>\n`;
    }

    svg += `<g id="character-root" class="character-idle" style="transform-origin: center; animation: float 3s ease-in-out infinite;">\n`;

    // Draw order (back to front): Right Arm, Right Leg, Left Leg, Body, Head, Left Arm
    // Coordinates based on origin (0,0) at bottom center

    // Right Arm (Backmost)
    svg += `<g id="right-arm">`;
    svg += drawBlock('right-arm-base', 4, 12, -2, 4, 12, 4, primary);
    svg += drawBlock('right-arm-trim', 4, 12, -2.1, 4.1, 2, 4.2, rankColor); // Shoulders trim
    svg += `</g>\n`;

    // Right Leg
    svg += `<g id="right-leg">`;
    svg += drawBlock('right-leg-base', 0, 0, -2, 4, 12, 4, primary);
    svg += drawBlock('right-leg-trim', 0, 0, -2.1, 4.1, 3, 4.2, rankColor); // Boot trim
    svg += `</g>\n`;

    // Left Leg (Front)
    svg += `<g id="left-leg">`;
    svg += drawBlock('left-leg-base', -4, 0, -2, 4, 12, 4, primary);
    svg += drawBlock('left-leg-trim', -4, 0, -2.1, 4.1, 3, 4.2, rankColor); // Boot trim
    svg += `</g>\n`;

    // Body
    svg += `<g id="body">`;
    svg += drawBlock('body-base', -4, 12, -2, 8, 12, 4, primary);
    // Chest trim geometry
    svg += drawBlock('body-accent', -2, 16, -2.1, 4, 4, 4.2, accent);
    svg += drawBlock('body-trim', -4, 12, -2.2, 8.2, 2, 4.4, rankColor); // belt
    svg += `</g>\n`;

    // Head
    svg += `<g id="head">`;
    svg += drawBlock('head-base', -4, 24, -4, 8, 8, 8, primary);
    svg += drawBlock('head-trim', -4.1, 30, -4.1, 8.2, 2.2, 8.2, rankColor); // Helmet band

    // Eyes & Pupils
    svg += `<g id="eyes">`;
    // Eye sockets
    const ex = -4, ey = 27, ez = 4; // Front face is Z=4
    svg += `<polygon points="${proj(ex + 1, ey, ez)} ${proj(ex + 3, ey, ez)} ${proj(ex + 3, ey + 1.5, ez)} ${proj(ex + 1, ey + 1.5, ez)}" fill="#0d0d2b" />`;
    svg += `<polygon points="${proj(ex + 5, ey, ez)} ${proj(ex + 7, ey, ez)} ${proj(ex + 7, ey + 1.5, ez)} ${proj(ex + 5, ey + 1.5, ez)}" fill="#0d0d2b" />`;
    svg += `</g>\n`;

    svg += `<g id="pupils" class="pupils-track">`;
    // Eye glows based on rank or accent
    svg += `<polygon points="${proj(ex + 1.5, ey + 0.5, ez + 0.1)} ${proj(ex + 2.5, ey + 0.5, ez + 0.1)} ${proj(ex + 2.5, ey + 1, ez + 0.1)} ${proj(ex + 1.5, ey + 1, ez + 0.1)}" fill="${accent}" filter="url(#glow-${id})"/>`;
    svg += `<polygon points="${proj(ex + 5.5, ey + 0.5, ez + 0.1)} ${proj(ex + 6.5, ey + 0.5, ez + 0.1)} ${proj(ex + 6.5, ey + 1, ez + 0.1)} ${proj(ex + 5.5, ey + 1, ez + 0.1)}" fill="${accent}" filter="url(#glow-${id})"/>`;
    svg += `</g>\n`;

    svg += `</g>\n`; // end head

    // Left Arm (Frontmost)
    svg += `<g id="left-arm">`;
    svg += drawBlock('left-arm-base', -8, 12, -2, 4, 12, 4, primary);
    svg += drawBlock('left-arm-trim', -8.1, 12, -2.1, 4.2, 2, 4.2, rankColor); // Shoulders trim
    svg += `</g>\n`;

    svg += `</g>\n`; // end character-root
    svg += `</svg>`;

    return svg;
}


// Configuration
const RANKS = {
    iron: '#8B8B8B',
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#00CED1',
    diamond: '#00BFFF',
    master: '#9B59B6',
    grandmaster: '#FF4500',
    challenger: '#FFFFFF'
};

const CLASSES = {
    adventurer: { primary: '#FF4500', accent: '#FFD700' },
    thinker: { primary: '#00BFFF', accent: '#E0F4FF' },
    guardian: { primary: '#00C896', accent: '#A0AEC0' },
    connector: { primary: '#C77DFF', accent: '#FFD166' }
};

// 1. Base Neutral
fs.writeFileSync(path.join(DIR, 'base-neutral.svg'), createCharacterSvg({
    id: 'base', primary: '#A0A0A0', accent: '#FFFFFF', rankColor: '#606060', basePlate: true
}));

// 2. Iron Ranks for all 4 classes
for (const [cls, colors] of Object.entries(CLASSES)) {
    fs.writeFileSync(path.join(DIR, `classes/${cls}-iron.svg`), createCharacterSvg({
        id: `${cls}-iron`, primary: colors.primary, accent: colors.accent, rankColor: RANKS.iron, basePlate: true, glowColor: hexToRgba(colors.primary, 0.4), className: cls, rankName: 'iron'
    }));
}

// 3. 9 Ranks for Adventurer
for (const [rank, color] of Object.entries(RANKS)) {
    fs.writeFileSync(path.join(DIR, `ranks/adventurer/${rank}.svg`), createCharacterSvg({
        id: `adv-${rank}`, primary: CLASSES.adventurer.primary, accent: color, rankColor: color, basePlate: true, glowColor: hexToRgba(color, 0.6), className: 'adventurer', rankName: rank
    }));
}

console.log('Successfully generated all character SVGs!');
