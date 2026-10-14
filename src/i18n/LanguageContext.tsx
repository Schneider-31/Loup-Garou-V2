import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from './translations';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  tRole: (key: string) => string;
  tRoleDesc: (key: string) => string;
  /** Instruction the Master reads out when this role wakes up at night. */
  tNight: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('wg-lang');
    return saved === 'ar' || saved === 'fr' ? saved : 'fr';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('wg-lang', newLang);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [dir, lang]);

  const t = (key: TranslationKey): string => {
    const tr = translations[lang] as Record<string, unknown>;
    const val = tr[key];
    return typeof val === 'string' ? val : key;
  };

  const tRole = (key: string): string => {
    const tr = translations[lang] as Record<string, unknown>;
    const roles = tr.roles as Record<string, string>;
    return roles?.[key] ?? key;
  };

  const tRoleDesc = (key: string): string => {
    const tr = translations[lang] as Record<string, unknown>;
    const descs = tr.roleDescriptions as Record<string, string>;
    return descs?.[key] ?? key;
  };

  const tNight = (key: string): string => {
    const tr = translations[lang] as Record<string, unknown>;
    const texts = tr.nightInstructions as Record<string, string>;
    return texts?.[key] ?? '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tRole, tRoleDesc, tNight, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
