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
    const [lang, setLang] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('lang') as Language | null;
        if (saved === 'en' || saved === 'km') setLang(saved);
    }, []);

    const toggleLanguage = useCallback(() => {
        setLang(prev => {
            const next = prev === 'en' ? 'km' : 'en';
            localStorage.setItem('lang', next);
            document.documentElement.lang = next === 'km' ? 'km' : 'en';
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
