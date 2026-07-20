'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language, Dictionary } from './dictionary';
import es from './dictionaries/es';
import en from './dictionaries/en';
import pt from './dictionaries/pt';
import fr from './dictionaries/fr';

const STORAGE_KEY = 'mg-support-lang';

const dictionaries: Record<Language, Dictionary> = { es, en, pt, fr };

interface I18nContextValue {
  lang: Language;
  t: (path: string) => string;
  setLang: (lang: Language) => void;
  availableLangs: { code: Language; label: string }[];
}

const availableLangs: { code: Language; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
];

function resolvePath(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('es');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && stored in dictionaries) {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (path: string): string => resolvePath(dictionaries[lang], path),
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, t, setLang, availableLangs }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
