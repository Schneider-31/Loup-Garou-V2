import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { isFeedbackOn, setFeedbackOn, vibrate } from '@/lib/feedback';

/** Small button that turns the sounds and vibrations on or off on this phone. */
export function SoundToggle() {
  const { t } = useLanguage();
  const [on, setOn] = useState<boolean>(() => isFeedbackOn());

  const toggle = () => {
    const next = !on;
    setFeedbackOn(next);
    setOn(next);
    if (next) vibrate(30);
  };

  const label = on ? t('feedbackOn') : t('feedbackOff');

  return (
    <button
      onClick={toggle}
      title={label}
      aria-label={label}
      className="w-9 h-9 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-300 transition-all hover:border-gold-500/40 hover:text-gold-300 active:scale-95"
    >
      {on ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
