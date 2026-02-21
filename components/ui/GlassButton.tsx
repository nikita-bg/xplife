'use client'

import { motion } from 'framer-motion'

export function GlassButton({
    icon: Icon,
    label,
    accentSide = 'left',
    accentColor = 'purple',
    onClick,
    isActive = false,
    badge,
}) {
    const isPurple = accentColor === 'purple'

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ x: accentSide === 'left' ? 4 : -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="glass-btn"
            data-active={isActive}
            data-accent={accentColor}
            data-side={accentSide}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '220px',
                height: '56px',
                paddingLeft: accentSide === 'left' ? '20px' : '14px',
                paddingRight: accentSide === 'right' ? '20px' : '14px',
                borderRadius: '28px',
                background: isActive
                    ? isPurple
                        ? 'rgba(155, 78, 221, 0.18)'
                        : 'rgba(0, 245, 255, 0.12)'
                    : 'var(--bg-card)',
                border: isActive
                    ? isPurple
                        ? '1px solid rgba(155, 78, 221, 0.6)'
                        : '1px solid rgba(0, 245, 255, 0.6)'
                    : isPurple
                        ? '1px solid rgba(155, 78, 221, 0.35)'
                        : '1px solid rgba(0, 245, 255, 0.35)',
                cursor: 'pointer',
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            {/* Accent edge */}
            <span
                style={{
                    position: 'absolute',
                    top: '8px',
                    bottom: '8px',
                    [accentSide]: 0,
                    width: '3px',
                    borderRadius: accentSide === 'left' ? '0 3px 3px 0' : '3px 0 0 3px',
                    background: isPurple
                        ? 'linear-gradient(180deg, #9D4EDD, #00F5FF)'
                        : 'linear-gradient(180deg, #00F5FF, #9D4EDD)',
                }}
            />

            {/* Icon */}
            {Icon && (
                <Icon
                    size={20}
                    style={{
                        color: isPurple ? 'var(--accent-purple-mid)' : 'var(--accent-cyan)',
                        flexShrink: 0,
                    }}
                />
            )}

            {/* Label */}
            <span
                style={{
                    fontFamily: 'var(--font-orbitron), sans-serif',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    flex: 1,
                    textAlign: 'left',
                }}
            >
                {label}
            </span>

            {/* Optional badge */}
            {badge != null && badge > 0 && (
                <span
                    style={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        background: isPurple ? 'var(--accent-purple-mid)' : 'var(--accent-cyan)',
                        color: isPurple ? '#fff' : 'var(--bg-base)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 5px',
                        flexShrink: 0,
                    }}
                >
                    {badge}
                </span>
            )}
        </motion.button>
    )
}
