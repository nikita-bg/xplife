'use client';

import React, { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';

/* ── Pure-Canvas Particle System ── */
const HeroParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animId: number;
        const colors = ['#00F5FF', '#FFB800', '#9B4EDD'];

        const particles: Array<{
            x: number; y: number; r: number;
            dx: number; dy: number; color: string;
            alpha: number; pulse: number;
        }> = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                r: Math.random() * 2 + 0.5,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2,
            });
        }

        const draw = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                p.pulse += 0.02;

                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;

                const currentAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

                ctx.beginPath();
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
                gradient.addColorStop(0, p.color + Math.round(currentAlpha * 80).toString(16).padStart(2, '0'));
                gradient.addColorStop(1, p.color + '00');
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = currentAlpha;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-[1] pointer-events-none opacity-40 mix-blend-screen"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

/* ── Hero Section ── */
const Hero = () => {
    const containerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.hero-anim',
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power3.out',
                    delay: 0.3,
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden flex items-end">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2940&auto=format&fit=crop")' }}
            ></div>

            <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>

            <HeroParticles />

            <div className="absolute inset-0 z-[2] bg-background/20 backdrop-blur-[2px]"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 md:pb-32 flex flex-col items-start justify-end h-full">
                <div className="max-w-4xl w-full">
                    <h1 className="hero-anim font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tightest text-ghost mb-2">
                        Your Life is the
                    </h1>

                    <div className="hero-anim group relative font-drama italic text-accent font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] mb-8 pr-4 py-2 cursor-default">
                        <span className="relative z-10 text-shadow-glow transition-all duration-300 group-hover:text-white">
                            Ultimate Quest.
                        </span>
                    </div>

                    <p className="hero-anim text-ghost/80 font-sans text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                        Transform boring goals into epic RPG quests. AI builds your daily missions. Earn XP. Level up for real.
                    </p>

                    <div className="hero-anim mb-8 group relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent via-tertiary to-accent rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>

                        <button className="btn-magnetic relative px-8 py-4 rounded-full bg-background border-2 border-accent text-accent hover:text-background hover:bg-accent transition-all duration-300 text-lg overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)] transition-opacity"></div>
                            <span className="btn-content font-heading font-bold tracking-wider uppercase flex items-center gap-3 relative z-10">
                                Start Playing Free
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
                                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    <div className="hero-anim flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 font-data text-xs sm:text-sm text-ghost/60 tracking-wider uppercase border-t border-white/10 pt-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent-secondary shadow-[0_0_8px_rgba(255,184,0,0.8)]"></span>
                            <span>4,920+ Active Players</span>
                        </div>
                        <span className="hidden sm:inline-block text-white/20">•</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(155,78,221,0.8)]"></span>
                            <span>146,400+ Quests Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
