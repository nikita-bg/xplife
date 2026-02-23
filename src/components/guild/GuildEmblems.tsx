import React from 'react';

const createSvg = (children: React.ReactNode) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
    >
        {children}
    </svg>
);

export const EMBLEMS = [
    {
        id: 'shield',
        icon: createSvg(<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />)
    },
    {
        id: 'sword',
        icon: createSvg(
            <>
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                <line x1="13" y1="19" x2="19" y2="13" />
                <line x1="16" y1="16" x2="20" y2="20" />
                <line x1="19" y1="21" x2="21" y2="19" />
            </>
        )
    },
    {
        id: 'dragon',
        icon: createSvg(
            <>
                {/* A stylized dragon / beast face pattern */}
                <path d="M9 10C9 10 12 7 15 10C18 13 21 10 21 10M3 14C3 14 6 17 9 14C12 11 15 14 15 14M11 6C11 6 14 3 17 6C20 9 23 6 23 6" />
                <circle cx="12" cy="12" r="2" />
            </>
        )
    },
    {
        id: 'crown',
        icon: createSvg(
            <>
                <path d="M2 4l3 12h14l3-12-6 7-4-11-4 11z" />
                <line x1="2" y1="20" x2="22" y2="20" />
            </>
        )
    },
    {
        id: 'flame',
        icon: createSvg(<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />)
    },
    {
        id: 'star',
        icon: createSvg(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />)
    },
    {
        id: 'moon',
        icon: createSvg(<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />)
    },
    {
        id: 'skull',
        icon: createSvg(
            <>
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
                <path d="M8 20v2h8v-2" />
                <path d="M12.5 17l-.5-1-.5 1h1z" />
                <path d="M16 20a2 2 0 001.56-2.25C18.2 14.28 19 12.53 19 10a7 7 0 10-14 0c0 2.53.8 4.28 1.44 7.75A2 2 0 008 20h8z" />
            </>
        )
    },
    {
        id: 'crystal',
        icon: createSvg(
            <>
                <polygon points="6 3 18 3 22 9 12 22 2 9" />
                <polygon points="12 22 8 9 12 3 16 9" />
            </>
        )
    },
    {
        id: 'lightning',
        icon: createSvg(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />)
    }
];

export const getEmblemIcon = (id: string) => {
    return EMBLEMS.find(e => e.id === id)?.icon || EMBLEMS[0].icon;
};
