import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, KeyRound, User as UserIcon } from 'lucide-react';
import type { Room } from '@/types';
import { loadSession } from '@/lib/session';

interface PlayerJoinScreenProps {
  onBack: () => void;
  onJoined: (roomId: string, playerId: string) => void;
}

export function PlayerJoinScreen({ onBack, onJoined }: PlayerJoinScreenProps) {
  const { t, lang } = useLanguage();
  const [code, setCode] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length > 0) {
      const newCode = ['', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      if (pasted.length < 4) {
        inputRefs.current[pasted.length]?.focus();
      } else {
        inputRefs.current[3]?.blur();
      }
    }
  };

  const fullCode = code.join('');

  const handleJoin = async () => {
    if (fullCode.length !== 4) {
      setError(t('invalidCode'));
      return;
    }
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find the room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', fullCode)
        .maybeSingle();

      if (roomError || !room) {
        setError(t('roomNotFound'));
        setLoading(false);
        return;
      }

      const roomData = room as Room;

      // Normalize the typed name: trim + collapse inner spaces.
      const cleanName = name.trim().replace(/\s+/g, ' ');
      const cleanLower = cleanName.toLowerCase();

      // Is this device already holding a seat in this room? (page refresh case)
      const saved = loadSession();
      const savedPlayerId =
        saved && saved.role === 'player' && saved.roomId === roomData.id
          ? saved.playerId
          : null;

      // Who is already in the room?
      const { data: roster, error: rosterError } = await supabase
        .from('players')
        .select('id, name')
        .eq('room_id', roomData.id);
      if (rosterError) throw rosterError;

      const sameName = (roster ?? []).find(
        (p) => p.name.trim().toLowerCase() === cleanLower
      );

      if (sameName) {
        if (savedPlayerId && sameName.id === savedPlayerId) {
          // Same device, same name: this is the same player coming back.
          onJoined(roomData.id, sameName.id);
          return;
        }
        // Someone else already uses this name: do NOT hand over their card.
        setError(t('nameTaken'));
        setLoading(false);
        return;
      }

      // New players can only join before the cards are dealt.
      if (roomData.status !== 'waiting') {
        setError(t('gameStarted'));
        setLoading(false);
        return;
      }

      const { data: player, error: insertError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: cleanName,
          language: lang,
        })
        .select('id')
        .single();

      if (insertError || !player) {
        // 23505 = unique violation: another phone took the same name a moment ago.
        if (insertError && insertError.code === '23505') {
          setError(t('nameTaken'));
          setLoading(false);
          return;
        }
        throw insertError ?? new Error('Failed to join');
      }

      onJoined(roomData.id, player.id);
    } catch {
      setError('Failed to join room. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-300 transition-all hover:border-moon-500/40 hover:text-moon-300 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <h1 className="font-display text-xl font-semibold text-moon-200">{t('joinGame')}</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-moon-500/20 rounded-full" />
            <KeyRound className="relative w-14 h-14 text-moon-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-ash-300">{t('enterRoomCode')}</p>
        </div>

        <div className="space-y-6">
          {/* Room code inputs */}
          <div className="flex justify-center gap-3" onPaste={handleCodePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className={`w-14 h-16 rounded-xl border text-center font-display text-2xl font-bold outline-none transition-all ${
                  digit
                    ? 'border-moon-500/50 bg-moon-900/30 text-moon-200 glow-moon'
                    : 'border-mystery-600/60 bg-mystery-800/50 text-ash-100'
                } focus:border-moon-400/60 focus:glow-moon`}
              />
            ))}
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-medium text-ash-300 mb-2">
              {t('enterName')}
            </label>
            <div className="relative">
              <UserIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-ash-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                maxLength={20}
                className="w-full rounded-xl border border-mystery-600/60 bg-mystery-800/50 ps-10 pe-4 py-3 text-sm text-ash-100 placeholder-ash-500 outline-none transition-all focus:border-moon-500/50 focus:glow-moon"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-blood-400 text-center animate-fade-in">{error}</p>
          )}

          <button
            onClick={handleJoin}
            disabled={loading || fullCode.length !== 4 || !name.trim()}
            className="w-full rounded-xl border border-moon-600/40 bg-gradient-to-r from-moon-800 to-moon-700 px-4 py-3.5 text-sm font-semibold text-moon-100 transition-all hover:from-moon-700 hover:to-moon-600 hover:glow-moon active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('joining')}
              </>
            ) : (
              t('joinRoom')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
