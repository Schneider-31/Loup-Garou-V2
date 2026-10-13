import { useLanguage } from '@/i18n/LanguageContext';
import { Crown, Users, Moon, Sparkles, RotateCcw } from 'lucide-react';

interface HomeScreenProps {
  onHost: () => void;
  onJoin: () => void;
  /** Shown when this device still has a room (host) or a card (player) saved. */
  resume?: { kind: 'host' | 'player'; onResume: () => void };
}

export function HomeScreen({ onHost, onJoin, resume }: HomeScreenProps) {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8 animate-fade-in-down">
          <div className="absolute inset-0 blur-3xl bg-gold-500/10 rounded-full" />
          <Moon className="relative w-20 h-20 text-gold-400 animate-float" strokeWidth={1} />
        </div>

        <div className="animate-fade-in-up">
          <h1 className="font-display text-4xl font-bold text-gradient-gold tracking-wider mb-2">
            {t('appTitle')}
          </h1>
          <p className="text-sm text-ash-300 mb-1">{t('appSubtitle')}</p>
          <p className="text-xs text-ash-400 max-w-xs">{t('welcomeSubtitle')}</p>
        </div>
      </div>

      {/* Choice cards */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        {resume && (
          <button
            onClick={resume.onResume}
            className="w-full flex items-center gap-3 rounded-2xl border border-forest-500/40 bg-forest-700/20 p-4 text-start transition-all hover:border-forest-500/70 active:scale-[0.98]"
          >
            <RotateCcw className="w-5 h-5 text-forest-500 shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-medium text-ash-100">
              {resume.kind === 'host' ? t('resumeHost') : t('resumePlayer')}
            </span>
          </button>
        )}

        <button
          onClick={onHost}
          className="group w-full relative overflow-hidden rounded-2xl border border-gold-600/30 bg-gradient-to-br from-mystery-800 to-mystery-900 p-5 text-start transition-all hover:border-gold-500/50 hover:glow-gold active:scale-[0.98]"
        >
          <div className="bg-card-grain absolute inset-0 opacity-50" />
          <div className="relative flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gold-900/40 border border-gold-700/40 flex items-center justify-center transition-transform group-hover:scale-110">
              <Crown className="w-7 h-7 text-gold-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-semibold text-gold-200 mb-0.5">
                {t('hostGame')}
              </h2>
              <p className="text-xs text-ash-300">{t('hostGameDesc')}</p>
            </div>
          </div>
        </button>

        <button
          onClick={onJoin}
          className="group w-full relative overflow-hidden rounded-2xl border border-moon-700/30 bg-gradient-to-br from-mystery-800 to-mystery-900 p-5 text-start transition-all hover:border-moon-500/50 hover:glow-moon active:scale-[0.98]"
        >
          <div className="bg-card-grain absolute inset-0 opacity-50" />
          <div className="relative flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-moon-900/40 border border-moon-700/40 flex items-center justify-center transition-transform group-hover:scale-110">
              <Users className="w-7 h-7 text-moon-300" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-semibold text-moon-200 mb-0.5">
                {t('joinGame')}
              </h2>
              <p className="text-xs text-ash-300">{t('joinGameDesc')}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-ash-500">
        <Sparkles className="w-3 h-3" />
        <span className="text-[10px] tracking-wider">{dir === 'rtl' ? 'لعبة جماعية' : 'Jeu de société'}</span>
      </div>
    </div>
  );
}
