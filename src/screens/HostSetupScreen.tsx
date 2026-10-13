import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Crown, ArrowLeft, Loader2 } from 'lucide-react';

interface HostSetupScreenProps {
  onBack: () => void;
  onRoomCreated: (roomId: string) => void;
}

function generateRoomCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

export function HostSetupScreen({ onBack, onRoomCreated }: HostSetupScreenProps) {
  const { t, lang } = useLanguage();
  const [hostName, setHostName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!hostName.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      let code = generateRoomCode();
      let attempts = 0;
      // Ensure code is unique
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('rooms')
          .select('code')
          .eq('code', code)
          .maybeSingle();
        if (!existing) break;
        code = generateRoomCode();
        attempts++;
      }

      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_name: hostName.trim(),
          host_language: lang,
          status: 'waiting',
          role_config: [],
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!data) throw new Error('Failed to create room');

      onRoomCreated(data.id);
    } catch {
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-300 transition-all hover:border-gold-500/40 hover:text-gold-300 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <h1 className="font-display text-xl font-semibold text-gold-200">{t('hostGame')}</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-gold-500/20 rounded-full" />
            <Crown className="relative w-14 h-14 text-gold-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-ash-300">{t('hostGameDesc')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ash-300 mb-2">
              {t('hostName')}
            </label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder={t('hostNamePlaceholder')}
              maxLength={20}
              className="w-full rounded-xl border border-mystery-600/60 bg-mystery-800/50 px-4 py-3 text-sm text-ash-100 placeholder-ash-500 outline-none transition-all focus:border-gold-500/50 focus:glow-gold"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {error && (
            <p className="text-xs text-blood-400 text-center animate-fade-in">{error}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-xl border border-gold-600/40 bg-gradient-to-r from-gold-800 to-gold-700 px-4 py-3.5 text-sm font-semibold text-gold-100 transition-all hover:from-gold-700 hover:to-gold-600 hover:glow-gold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('creating')}
              </span>
            ) : (
              t('createRoom')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
