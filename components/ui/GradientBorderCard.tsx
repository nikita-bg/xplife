'use client'

import type { CSSProperties, ReactNode } from 'react'

interface GradientBorderCardProps {
    children: ReactNode
    style?: CSSProperties
    className?: string
}

export function GradientBorderCard({ children, style = {}, className = '' }: GradientBorderCardProps) {
    return (
        <div
            style={{
                position: 'relative',
                padding: '1.5px',
                borderRadius: '28px',
                background: 'linear-gradient(135deg, #9D4EDD, #00F5FF, #9D4EDD)',
                backgroundSize: '300% 300%',
                animation: 'gradient-rotate 4s ease infinite',
                ...style,
            }}
            className={className}
        >
            <div
                style={{
                    borderRadius: '27px',
                    background: 'rgba(13, 17, 40, 0.92)',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {children}
            </div>
        </div>
    )
}
