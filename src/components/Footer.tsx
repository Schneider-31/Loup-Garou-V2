import { useLanguage } from '@/i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-mystery-700/50 glass">
      <div className="flex items-center justify-center py-2 px-4">
        <span className="text-[11px] tracking-wide text-ash-400 font-body">
          {t('directedBy')}
        </span>
      </div>
    </footer>
  );
}
