'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const;

export function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentLocale = pathname.split('/')[1] || 'en';
    const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

    const handleChange = (locale: string) => {
        const segments = pathname.split('/');
        segments[1] = locale;
        router.push(segments.join('/'));
        setOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-ghost/60 hover:text-ghost transition-colors font-sans text-sm px-2 py-1 rounded-lg hover:bg-white/5"
            >
                <Globe size={14} />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[#0C1021]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleChange(lang.code)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 font-sans text-sm hover:bg-white/5 transition-colors ${currentLocale === lang.code ? 'text-accent bg-accent/5' : 'text-ghost/60'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {currentLocale === lang.code && <span className="ml-auto text-[10px] text-accent">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
