import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080B1A',     // Void
        primary: '#080B1A',        // Void
        accent: '#00F5FF',         // Cyan Plasma
        'accent-secondary': '#FFB800', // Gold XP
        tertiary: '#9B4EDD',       // Deep Purple
        ghost: '#E8E6F0',          // Ghost text
      },
      fontFamily: {
        heading: ['var(--font-orbitron)', 'sans-serif'],
        drama: ['var(--font-cinzel)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        data: ['var(--font-jetbrains)', 'monospace'],
      },
      letterSpacing: {
        tightest: '-.075em',
        tighter: '-.05em',
        tight: '-.025em',
        normal: '0',
        wide: '.025em',
        wider: '.05em',
        widest: '.1em',
        widestest: '.25em',
      },
    },
  },
  plugins: [],
};
export default config;
