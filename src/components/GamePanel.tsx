import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, Play, Trophy, Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { getRoleByKey } from '@/data/roles';
import { countAlive, stepsForNight, winHint } from '@/data/nightGuide';
import type { GamePhase, Player, Room } from '@/types';

interface GamePanelProps {
  room: Room;
  players: Player[];
  busy: boolean;
  onSetPhase: (phase: GamePhase, round: number) => void;
}

function fill(template: string, n: number): string {
  return template.replace('{n}', String(n));
}

/** Host tools shown once the cards are dealt: night/day, counters, night guide. */
export function GamePanel({ room, players, busy, onSetPhase }: GamePanelProps) {
  const { t, tRole, tNight } = useLanguage();
  const phase = room.phase;
  const round = room.round_number >= 1 ? room.round_number : 1;

  const counts = useMemo(() => countAlive(players), [players]);
  const hint = winHint(counts);

  const presentKeys = useMemo(
    () => new Set(players.map((p) => p.assigned_role).filter((r): r is string => !!r)),
    [players],
  );
  const steps = useMemo(() => stepsForNight(presentKeys, round), [presentKeys, round]);

  // Custom roles are grouped by title: the host places them in the night himself.
  const customGroups = useMemo(() => {
    const groups = new Map<string, Player[]>();
    for (const p of players) {
      if (p.assigned_role && p.assigned_custom_title != null) {
        const list = groups.get(p.assigned_custom_title) ?? [];
        list.push(p);
        groups.set(p.assigned_custom_title, list);
      }
    }
    return Array.from(groups.entries());
  }, [players]);

  // Which night steps the host has already completed (local to this screen).
  const [done, setDone] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setDone(new Set());
  }, [phase, round]);

  const toggleDone = (roleKey: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(roleKey)) next.delete(roleKey);
      else next.add(roleKey);
      return next;
    });
  };

  const currentIndex = steps.findIndex((s) => !done.has(s.roleKey));

  const phaseLabel =
    phase === 'lobby'
      ? t('lobbyWaiting')
      : phase === 'night'
        ? fill(t('nightN'), round)
        : fill(t('dayN'), round);

  const next: { label: string; phase: GamePhase; round: number } =
    phase === 'lobby'
      ? { label: fill(t('startNight'), round), phase: 'night', round }
      : phase === 'night'
        ? { label: t('startDay'), phase: 'day', round }
        : { label: fill(t('startNight'), round + 1), phase: 'night', round: round + 1 };

  const holders = (roleKey: string): Player[] => players.filter((p) => p.assigned_role === roleKey);

  const chip = (p: Player) => (
    <span
      key={p.id}
      className={`rounded-md border px-2 py-0.5 text-[11px] ${
        p.is_alive
          ? 'border-mystery-500/50 bg-mystery-700/50 text-ash-100'
          : 'border-mystery-700/50 bg-mystery-800/40 text-ash-500 line-through'
      }`}
    >
      {p.name}
    </span>
  );

  return (
    <div className="mb-6 space-y-4">
      {/* Phase + main button */}
      <div className="rounded-2xl border border-gold-700/30 bg-gradient-to-br from-mystery-800 to-mystery-900 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="shrink-0 w-10 h-10 rounded-xl border border-gold-700/40 bg-gold-900/30 flex items-center justify-center">
            {phase === 'day' ? (
              <Sun className="w-5 h-5 text-gold-300" strokeWidth={1.5} />
            ) : (
              <Moon className="w-5 h-5 text-moon-300" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ash-400">{t('gameControl')}</p>
            <p className="text-sm font-semibold text-gold-200">{phaseLabel}</p>
          </div>
        </div>
        <button
          onClick={() => onSetPhase(next.phase, next.round)}
          disabled={busy}
          className="w-full rounded-xl border border-gold-600/40 bg-gradient-to-r from-gold-800 to-gold-700 px-4 py-3 text-sm font-semibold text-gold-100 transition-all hover:from-gold-700 hover:to-gold-600 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          {next.label}
        </button>
      </div>

      {/* Counters */}
      <div>
        <p className="text-[11px] text-ash-400 mb-2">{t('aliveNow')}</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-blood-800/40 bg-blood-900/20 p-3 text-center">
            <p className="text-2xl font-display font-bold text-blood-300">{counts.wolves}</p>
            <p className="text-[10px] text-ash-400">{t('statWolves')}</p>
          </div>
          <div className="rounded-xl border border-moon-700/40 bg-moon-900/30 p-3 text-center">
            <p className="text-2xl font-display font-bold text-moon-300">{counts.village}</p>
            <p className="text-[10px] text-ash-400">{t('statVillage')}</p>
          </div>
          <div className="rounded-xl border border-mystery-600/50 bg-mystery-800/40 p-3 text-center">
            <p className="text-2xl font-display font-bold text-ash-100">{counts.total}</p>
            <p className="text-[10px] text-ash-400">{t('statAlive')}</p>
          </div>
        </div>
        {hint && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-gold-600/40 bg-gold-900/20 p-3 animate-fade-in">
            <Trophy className="w-4 h-4 text-gold-300 shrink-0" />
            <p className="text-xs font-medium text-gold-200">
              {hint === 'village' ? t('winVillage') : t('winWolves')}
            </p>
          </div>
        )}
      </div>

      {/* Night guide */}
      {phase === 'night' && (
        <div className="rounded-2xl border border-moon-700/30 bg-gradient-to-br from-mystery-800 to-mystery-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Moon className="w-4 h-4 text-moon-300" />
            <h3 className="text-sm font-semibold text-moon-200">{t('nightGuideTitle')}</h3>
          </div>
          <p className="text-[11px] text-ash-400 mb-3">{t('nightGuideHint')}</p>

          {steps.length === 0 ? (
            <p className="text-xs text-ash-300">{t('nightGuideEmpty')}</p>
          ) : (
            <div className="space-y-2">
              {steps.map((step, index) => {
                const role = getRoleByKey(step.roleKey);
                if (!role) return null;
                const Icon = role.icon;
                const isDone = done.has(step.roleKey);
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={step.roleKey}
                    onClick={() => toggleDone(step.roleKey)}
                    className={`w-full text-start rounded-xl border p-3 transition-all active:scale-[0.99] ${
                      isDone
                        ? 'border-forest-600/30 bg-forest-800/20 opacity-60'
                        : isCurrent
                          ? 'border-gold-500/50 bg-gold-900/20'
                          : 'border-mystery-700/50 bg-mystery-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-4 h-4 text-ash-100" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-ash-500">{index + 1}</span>
                          <p className="text-sm font-semibold text-ash-100">{tRole(step.roleKey)}</p>
                          {isDone && <Check className="w-4 h-4 text-forest-500" />}
                        </div>
                        <p className="text-[11px] text-ash-300 mt-1 leading-relaxed">
                          {tNight(step.roleKey)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {holders(step.roleKey).map(chip)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {steps.length > 0 && currentIndex === -1 && (
            <p className="mt-3 text-xs font-medium text-forest-500 text-center animate-fade-in">
              {t('nightGuideDone')}
            </p>
          )}

          {customGroups.length > 0 && (
            <div className="mt-3 rounded-xl border border-gold-700/30 bg-gold-900/10 p-3">
              <p className="text-[11px] text-gold-300 mb-2">{t('customRolesNote')}</p>
              <div className="space-y-2">
                {customGroups.map(([title, list]) => (
                  <div key={title}>
                    <p className="text-xs font-medium text-ash-100">{title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">{list.map(chip)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day guide */}
      {phase === 'day' && (
        <div className="rounded-2xl border border-gold-700/30 bg-gradient-to-br from-mystery-800 to-mystery-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-gold-300" />
            <h3 className="text-sm font-semibold text-gold-200">{t('dayGuideTitle')}</h3>
          </div>
          <p className="text-xs text-ash-300 leading-relaxed">{t('dayGuide')}</p>
        </div>
      )}
    </div>
  );
}
