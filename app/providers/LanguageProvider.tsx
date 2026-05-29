'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Language = 'en' | 'km';

interface LanguageContextValue {
    lang: Language;
    toggleLanguage: () => void;
    isKhmer: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
    lang: 'en',
    toggleLanguage: () => {},
    isKhmer: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>(() => {
        try {
            if (typeof window === 'undefined') return 'en';
            const saved = localStorage.getItem('lang') as Language | null;
            return saved === 'en' || saved === 'km' ? saved : 'en';
        } catch {
            return 'en';
        }
    });

    useEffect(() => {
        document.documentElement.lang = lang === 'km' ? 'km' : 'en';
    }, [lang]);

    const toggleLanguage = useCallback(() => {
        setLang(prev => {
            const next = prev === 'en' ? 'km' : 'en';
            localStorage.setItem('lang', next);
            return next;
        });
    }, []);

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, isKhmer: lang === 'km' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
