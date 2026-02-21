import os

def iso_scr(x, y, z, cx, cy, scale):
    sx = cx + (x - y) * scale
    sy = cy + (x + y) * scale * 0.5 - z * scale
    return sx, sy

class SVGBuilder:
    def __init__(self, item_id, item_type, cl, rarity, name, primary, accent, cx=64, cy=64, scale=4):
        self.blocks = []
        self.item_id = item_id
        self.type = item_type
        self.cl = cl
        self.rarity = rarity
        self.name = name
        self.primary = primary
        self.accent = accent
        self.cx = cx
        self.cy = cy
        self.scale = scale

    def add_block(self, x, y, z, w, d, h, color='primary', glow=False):
        self.blocks.append({
            'x': x, 'y': y, 'z': z,
            'w': w, 'd': d, 'h': h,
            'color': color,
            'glow': glow,
            'depth': (x + w/2) + (y + d/2) + (z + h/2)
        })

    def render_blocks(self, blocks, cx, cy, scale):
        blocks_sorted = sorted(blocks, key=lambda b: b['depth'])
        svg = []
        
        for b in blocks_sorted:
            x, y, z = b['x'], b['y'], b['z']
            w, d, h = b['w'], b['d'], b['h']
            
            pts = {
                '000': iso_scr(x, y, z, cx, cy, scale),
                '100': iso_scr(x+w, y, z, cx, cy, scale),
                '010': iso_scr(x, y+d, z, cx, cy, scale),
                '110': iso_scr(x+w, y+d, z, cx, cy, scale),
                '001': iso_scr(x, y, z+h, cx, cy, scale),
                '101': iso_scr(x+w, y, z+h, cx, cy, scale),
                '011': iso_scr(x, y+d, z+h, cx, cy, scale),
                '111': iso_scr(x+w, y+d, z+h, cx, cy, scale),
            }
            
            if b['color'] == 'primary':
                base_col = "var(--item-primary)"
            elif b['color'] == 'accent':
                base_col = "var(--item-accent)"
            else:
                base_col = b['color']
                
            glow_str = ' stroke="var(--item-accent)" stroke-width="1" stroke-opacity="0.8" stroke-linejoin="round"' if b['glow'] else ''
            
            p_top = f"{pts['001'][0]},{pts['001'][1]} {pts['101'][0]},{pts['101'][1]} {pts['111'][0]},{pts['111'][1]} {pts['011'][0]},{pts['011'][1]}"
            p_right = f"{pts['100'][0]},{pts['100'][1]} {pts['110'][0]},{pts['110'][1]} {pts['111'][0]},{pts['111'][1]} {pts['101'][0]},{pts['101'][1]}"
            p_left = f"{pts['010'][0]},{pts['010'][1]} {pts['110'][0]},{pts['110'][1]} {pts['111'][0]},{pts['111'][1]} {pts['011'][0]},{pts['011'][1]}"

            svg.append(f'    <polygon points="{p_left}" fill="{base_col}"{glow_str} />')
            svg.append(f'    <polygon points="{p_right}" fill="{base_col}"{glow_str} />')
            svg.append(f'    <polygon points="{p_right}" fill="rgba(0,0,0,0.25)" stroke="none" pointer-events="none" />')
            svg.append(f'    <polygon points="{p_top}" fill="{base_col}"{glow_str} />')
            svg.append(f'    <polygon points="{p_top}" fill="rgba(255,255,255,0.3)" stroke="none" pointer-events="none" />')
            
        return "\\n".join(svg)

    def render(self):
        svg = []
        svg.append(f'<!--\\nitem_id: "{self.item_id}"\\ntype: "{self.type}"\\nclass: "{self.cl}"\\nrarity: "{self.rarity}"\\nname: "{self.name}"\\nprimary_color: "{self.primary}"\\naccent_color: "{self.accent}"\\n-->')
        svg.append(f'<svg viewBox="0 0 128 128" width="128" height="128" xmlns="http://www.w3.org/2000/svg" style="--item-primary: {self.primary}; --item-accent: {self.accent};">')
        svg.append('  <defs>\\n    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">\\n      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.6)"/>\\n    </filter>\\n  </defs>')
        
        svg.append(f'  <g id="item-{self.type}-{self.cl}" filter="url(#shadow)">')
        svg.append(self.render_blocks(self.blocks, self.cx, self.cy, self.scale))
        svg.append('  </g>')
        
        if self.type == "weapon":
            svg.append(f'  <g id="weapon-hand-version" transform="translate(48, 48) scale(0.5)" filter="url(#shadow)">')
            svg.append(self.render_blocks(self.blocks, self.cx, self.cy, self.scale))
            svg.append('  </g>')
            
        svg.append('</svg>\\n')
        return "\\n".join(svg)


def make_adv_head():
    b = SVGBuilder("flame_helm_adventurer", "head", "adventurer", "common", "Flame Helm", "#FF4500", "#FFD700", scale=5)
    b.add_block(-3, -3, 0, 6, 6, 6)
    b.add_block(-3.2, -1, 2, 6.4, 2, 1.5, "accent", True)
    b.add_block(-1, -3.2, 2, 2, 6.4, 1.5, "accent", True)
    b.add_block(-3.5, -0.5, 4, 1, 1, 3, "accent")
    b.add_block(-0.5, -3.5, 4, 1, 1, 3, "accent")
    return b
    
def make_adv_body():
    b = SVGBuilder("berserker_plate_adventurer", "body", "adventurer", "common", "Berserker Plate", "#FF4500", "#FFD700", scale=4)
    b.add_block(-4, -2, -5, 8, 4, 9)
    b.add_block(3, -2.5, 1, 3, 5, 4)
    b.add_block(-2.5, 3, 1, 5, 3, 4)
    b.add_block(3.5, -1, -2, 1, 2, 3, "accent", True)
    b.add_block(-1, 3.5, -2, 2, 1, 3, "accent", True)
    return b

def make_adv_arms():
    b = SVGBuilder("crusher_gauntlets_adventurer", "arms", "adventurer", "common", "Crusher Gauntlets", "#FF4500", "#FFD700", scale=4)
    b.add_block(4, -1, -6, 3, 3, 5)
    b.add_block(7, 0, -5, 1, 1, 2, "accent", True)
    b.add_block(-1, 4, -6, 3, 3, 5)
    b.add_block(0, 7, -5, 1, 1, 2, "accent", True)
    return b

def make_adv_legs():
    b = SVGBuilder("warlord_greaves_adventurer", "legs", "adventurer", "common", "Warlord Greaves", "#FF4500", "#FFD700", scale=4)
    b.add_block(1, -1.5, -12, 3, 3, 7)
    b.add_block(4, -0.5, -8, 1, 1, 2, "accent", True)
    b.add_block(-1.5, 1, -12, 3, 3, 7)
    b.add_block(-0.5, 4, -8, 1, 1, 2, "accent", True)
    return b

def make_adv_weapon():
    b = SVGBuilder("inferno_blade_adventurer", "weapon", "adventurer", "common", "Inferno Blade", "#FF4500", "#FFD700", scale=3, cy=80)
    b.add_block(-1, -1, -4, 2, 2, 6, "rgba(50,50,50,1)")
    b.add_block(-3, -3, 2, 6, 6, 2, "accent", True)
    b.add_block(-2, -2, 4, 4, 4, 16, "primary", True)
    b.add_block(-2.5, -2.5, 8, 1, 1, 1, "accent", True)
    b.add_block(2.5, 2.5, 12, 1, 1, 1, "accent", True)
    b.add_block(3, -2, 16, 1, 1, 1, "rgba(255,200,0,1)", True)
    b.add_block(-2, 3, 6, 1, 1, 1, "rgba(255,200,0,1)", True)
    return b


def make_thi_head():
    b = SVGBuilder("neural_crown_thinker", "head", "thinker", "common", "Neural Crown", "#00BFFF", "#E0F4FF", scale=5)
    b.add_block(-3.5, -3.5, 1, 7, 7, 2)
    b.add_block(-4, -1, 1.5, 8, 2, 1.5, "accent", True)
    b.add_block(-1, -4, 1.5, 2, 8, 1.5, "accent", True)
    b.add_block(-3, -3, 3, 1, 1, 4, "accent", True)
    b.add_block(-3.2, -3.2, 7, 1.4, 1.4, 1.4, "accent", True)
    return b

def make_thi_body():
    b = SVGBuilder("circuit_robe_thinker", "body", "thinker", "common", "Circuit Robe", "#00BFFF", "#E0F4FF", scale=4)
    b.add_block(-3, -3, -6, 6, 6, 10)
    b.add_block(-3.2, -1, -2, 6.4, 2, 4, "accent", True)
    b.add_block(-1, -3.2, -2, 2, 6.4, 4, "accent", True)
    b.add_block(2, 2, -5, 1.5, 1.5, 9, "rgba(0,191,255,0.5)")
    return b

def make_thi_arms():
    b = SVGBuilder("data_gloves_thinker", "arms", "thinker", "common", "Data Gloves", "#00BFFF", "#E0F4FF", scale=4)
    b.add_block(3.5, -1, -5, 2, 2, 6)
    b.add_block(4.5, -2, -3, 0.5, 4, 3, "accent", True)
    b.add_block(-1, 3.5, -5, 2, 2, 6)
    b.add_block(-2, 4.5, -3, 4, 0.5, 3, "accent", True)
    return b

def make_thi_legs():
    b = SVGBuilder("flux_boots_thinker", "legs", "thinker", "common", "Flux Boots", "#00BFFF", "#E0F4FF", scale=4)
    b.add_block(1.5, -1.5, -12, 2, 2, 8)
    b.add_block(1.2, -1.8, -12, 2.6, 2.6, 2, "accent", True)
    b.add_block(-1.5, 1.5, -12, 2, 2, 8)
    b.add_block(-1.8, 1.2, -12, 2.6, 2.6, 2, "accent", True)
    return b

def make_thi_weapon():
    b = SVGBuilder("arcane_staff_thinker", "weapon", "thinker", "common", "Arcane Staff", "#00BFFF", "#E0F4FF", scale=3, cy=90)
    b.add_block(-0.5, -0.5, -6, 1, 1, 16, "rgba(100,100,100,1)")
    b.add_block(-2, -2, 10, 4, 4, 4, "accent", True)
    b.add_block(-4, 0, 11, 2, 2, 2, "accent", True)
    b.add_block(2, 0, 15, 1.5, 1.5, 1.5, "accent", True)
    b.add_block(0, -4, 9, 2, 2, 2, "primary", True)
    return b


def make_gua_head():
    b = SVGBuilder("bastion_helm_guardian", "head", "guardian", "common", "Bastion Helm", "#00C896", "#A0AEC0", scale=5)
    b.add_block(-4, -4, 0, 8, 8, 5, "accent")
    b.add_block(-4.2, -1.5, 1.5, 8.4, 3, 1, "primary", True)
    b.add_block(-1.5, -4.2, 1.5, 3, 8.4, 1, "primary", True)
    b.add_block(-3, -3, 5, 2, 2, 2, "accent")
    b.add_block(-0.5, -0.5, 5, 2, 2, 3, "accent")
    b.add_block(2, 2, 5, 2, 2, 2, "accent")
    return b

def make_gua_body():
    b = SVGBuilder("fortress_chest_guardian", "body", "guardian", "common", "Fortress Chest", "#00C896", "#A0AEC0", scale=4)
    b.add_block(-5, -3, -5, 10, 6, 10, "accent")
    b.add_block(-3, -5, -5, 6, 10, 10, "accent")
    b.add_block(-4, -4, -4, 8, 8, 8, "primary")
    b.add_block(4.5, -2, 0, 1, 4, 4, "primary", True)
    b.add_block(-2, 4.5, 0, 4, 1, 4, "primary", True)
    return b

def make_gua_arms():
    b = SVGBuilder("tower_shields_guardian", "arms", "guardian", "common", "Tower Shields", "#00C896", "#A0AEC0", scale=4)
    b.add_block(5, -2, -6, 2, 4, 10, "accent")
    b.add_block(6.5, -1, -3, 1, 2, 4, "primary", True)
    b.add_block(-2, 5, -6, 4, 2, 10, "accent")
    b.add_block(-1, 6.5, -3, 2, 1, 4, "primary", True)
    return b

def make_gua_legs():
    b = SVGBuilder("rampart_stompers_guardian", "legs", "guardian", "common", "Rampart Stompers", "#00C896", "#A0AEC0", scale=4)
    b.add_block(1, -2, -12, 4, 4, 8, "accent")
    b.add_block(2, -0.5, -8, 2, 2, 1, "primary", True)
    b.add_block(-2, 1, -12, 4, 4, 8, "accent")
    b.add_block(-0.5, 2, -8, 2, 2, 1, "primary", True)
    return b

def make_gua_weapon():
    b = SVGBuilder("siege_hammer_guardian", "weapon", "guardian", "common", "Siege Hammer", "#00C896", "#A0AEC0", scale=3, cy=80)
    b.add_block(-1, -1, -6, 2, 2, 16, "rgba(80,80,80,1)")
    b.add_block(-4, -4, 10, 8, 8, 6, "accent")
    b.add_block(-4.5, -2, 11, 9, 4, 4, "primary", True)
    b.add_block(-2, -4.5, 11, 4, 9, 4, "primary", True)
    return b


def make_con_head():
    b = SVGBuilder("spirit_mask_connector", "head", "connector", "common", "Spirit Mask", "#C77DFF", "#FFD166", scale=5)
    b.add_block(-3, -3, 0, 6, 6, 5)
    b.add_block(-3.5, -3.5, 2, 7, 3, 1, "accent", True)
    b.add_block(-3.5, -0.5, 2, 3, 7, 1, "accent", True)
    b.add_block(-3.2, -1.5, 3, 6.4, 3, 1.5, "primary", True)
    b.add_block(-1.5, -3.2, 3, 3, 6.4, 1.5, "primary", True)
    return b

def make_con_body():
    b = SVGBuilder("harmony_vest_connector", "body", "connector", "common", "Harmony Vest", "#C77DFF", "#FFD166", scale=4)
    b.add_block(-3.5, -3.5, -5, 7, 7, 9)
    b.add_block(-4, -4, -3, 8, 8, 2, "accent")
    b.add_block(-4, -4, 1, 8, 8, 2, "accent")
    return b
    
def make_con_arms():
    b = SVGBuilder("bond_bracers_connector", "arms", "connector", "common", "Bond Bracers", "#C77DFF", "#FFD166", scale=4)
    b.add_block(3, -1.5, -5, 3, 3, 6)
    b.add_block(2.5, -2, -3, 4, 4, 1.5, "accent", True)
    b.add_block(2.5, -2, -1, 4, 4, 1.5, "accent", True)
    b.add_block(-1.5, 3, -5, 3, 3, 6)
    b.add_block(-2, 2.5, -3, 4, 4, 1.5, "accent", True)
    b.add_block(-2, 2.5, -1, 4, 4, 1.5, "accent", True)
    return b

def make_con_legs():
    b = SVGBuilder("flow_walkers_connector", "legs", "connector", "common", "Flow Walkers", "#C77DFF", "#FFD166", scale=4)
    b.add_block(1.5, -1.5, -10, 2, 2, 6)
    b.add_block(1, -2, -12, 3, 3, 2)
    b.add_block(1, -2, -8, 3, 3, 1, "accent", True)
    b.add_block(-1.5, 1.5, -10, 2, 2, 6)
    b.add_block(-2, 1, -12, 3, 3, 2)
    b.add_block(-2, 1, -8, 3, 3, 1, "accent", True)
    return b

def make_con_weapon():
    b = SVGBuilder("soul_orb_connector", "weapon", "connector", "common", "Soul Orb", "#C77DFF", "#FFD166", scale=4, cy=64)
    b.add_block(-2, -2, 4, 4, 4, 4, "accent", True)
    b.add_block(-3, -2, 4.5, 6, 4, 3, "primary")
    b.add_block(-2, -3, 4.5, 4, 6, 3, "primary")
    b.add_block(-2.5, -2.5, 3.5, 5, 5, 5, "rgba(199,125,255,0.5)")
    b.add_block(3, 3, 8, 1.5, 1.5, 1.5, "accent", True)
    b.add_block(-3, -3, 2, 1.5, 1.5, 1.5, "accent", True)
    b.add_block(-4, 2, 5, 1, 1, 1, "primary", True)
    return b

def make_preview_sheet(builders):
    svg = []
    svg.append('<svg viewBox="0 0 640 512" width="640" height="512" xmlns="http://www.w3.org/2000/svg" style="background:#080B1A;">')
    svg.append('  <defs>\\n    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">\\n      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.6)"/>\\n    </filter>\\n  </defs>')
    
    classes = ["adventurer", "thinker", "guardian", "connector"]
    types = ["head", "body", "arms", "legs", "weapon"]
    
    for row, cl in enumerate(classes):
        for col, t in enumerate(types):
            b = next(b for b in builders if b.cl == cl and b.type == t)
            dx = col * 128
            dy = row * 128
            svg.append(f'  <g transform="translate({dx}, {dy})" style="--item-primary: {b.primary}; --item-accent: {b.accent};" filter="url(#shadow)">')
            svg.append(b.render_blocks(b.blocks, b.cx, b.cy, b.scale))
            svg.append('  </g>')
            svg.append(f'  <text x="{dx+64}" y="{dy+120}" fill="#A0AEC0" font-family="sans-serif" font-size="10" text-anchor="middle">{b.name}</text>')
            
    svg.append('</svg>\\n')
    return "\\n".join(svg)

def generate_all():
    items_dir = "public/character-system/items"
    os.makedirs(items_dir, exist_ok=True)
    builders = [
        make_adv_head(), make_adv_body(), make_adv_arms(), make_adv_legs(), make_adv_weapon(),
        make_thi_head(), make_thi_body(), make_thi_arms(), make_thi_legs(), make_thi_weapon(),
        make_gua_head(), make_gua_body(), make_gua_arms(), make_gua_legs(), make_gua_weapon(),
        make_con_head(), make_con_body(), make_con_arms(), make_con_legs(), make_con_weapon()
    ]
    for b in builders:
        with open(f"{items_dir}/{b.item_id}.svg", "w") as f:
            f.write(b.render())
            
    with open(f"{items_dir}/preview_sheet.svg", "w") as f:
        f.write(make_preview_sheet(builders))
    
    print(f"Generated {len(builders)} items and preview sheet at {items_dir}")

if __name__ == '__main__':
    generate_all()
