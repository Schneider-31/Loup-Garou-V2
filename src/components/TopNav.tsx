import { useLanguage } from '@/i18n/LanguageContext';
import { Languages, Moon } from 'lucide-react';

export function TopNav() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-mystery-700/50 glass">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Moon className="w-5 h-5 text-gold-400" />
            <div className="absolute inset-0 blur-md bg-gold-500/30 rounded-full" />
          </div>
          <span className="font-display text-sm font-semibold text-gradient-gold tracking-wider">
            {t('appTitle')}
          </span>
        </div>

        <button
          onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
          className="flex items-center gap-1.5 rounded-lg border border-mystery-600/60 bg-mystery-800/50 px-3 py-1.5 text-xs font-medium text-ash-200 transition-all hover:border-gold-500/40 hover:text-gold-300 active:scale-95"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
        </button>
      </div>
    </header>
  );
}
