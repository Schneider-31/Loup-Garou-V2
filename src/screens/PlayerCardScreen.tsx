import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { getRoleByKey, makeCustomRole } from '@/data/roles';
import type { Player, Room } from '@/types';
import { clearSession } from '@/lib/session';
import {
  Loader2,
  Eye,
  EyeOff,
  Hand,
  Moon,
  Hourglass,
  LogOut,
} from 'lucide-react';

interface PlayerCardScreenProps {
  roomId: string;
  playerId: string;
  onLeave: () => void;
}

export function PlayerCardScreen({ roomId, playerId, onLeave }: PlayerCardScreenProps) {
  const { t, tRole, tRoleDesc, dir } = useLanguage();
  const [player, setPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(false);
  const [seenOnce, setSeenOnce] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  // Keep the latest onLeave in a ref so loadData does not change on every render.
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;
  const progressRef = useRef<HTMLDivElement>(null);

  // Load player and room data, then poll as a fallback in case realtime drops.
  // Realtime is the primary sync mechanism; polling ensures recovery if the
  // websocket disconnects or events are missed.
  const loadData = useCallback(async () => {
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .maybeSingle();
    if (playerData) {
      setPlayer(playerData as Player);
      setSeenOnce((playerData as Player).has_seen_card);
    } else if (!playerError) {
      // The row is gone (host removed us or closed the room): go back to Home.
      clearSession();
      onLeaveRef.current();
      return;
    }

    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    if (roomData) setRoom(roomData as Room);
  }, [playerId, roomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to player + room changes, with a polling fallback for resilience.
  useEffect(() => {
    const channel = supabase
      .channel(`player-${playerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `id=eq.${playerId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        const p = payload.new as Player;
        setPlayer(p);
        setSeenOnce(p.has_seen_card);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        setRoom(payload.new as Room);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setTimeout(() => loadData(), 1000);
        }
      });

    // Poll every 10s as a fallback for missed realtime events (reduced from 3s
    // to minimize unnecessary database load when 25+ players are connected).
    // Realtime is the primary sync mechanism; this is only a safety net.
    const pollInterval = setInterval(loadData, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [playerId, roomId, loadData]);

  const markSeen = useCallback(async () => {
    if (!seenOnce) {
      await supabase
        .from('players')
        .update({ has_seen_card: true, updated_at: new Date().toISOString() })
        .eq('id', playerId);
    }
  }, [playerId, seenOnce]);

  const startHold = () => {
    if (!player?.assigned_role) return;
    setHolding(true);
    holdTimerRef.current = window.setTimeout(() => {
      setRevealed(true);
      markSeen();
    }, 600);
  };

  const endHold = () => {
    setHolding(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setRevealed(false);
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const handleLeave = async () => {
    await supabase.from('players').delete().eq('id', playerId);
    clearSession();
    onLeave();
  };

  const status = room?.status || 'waiting';
  const hasRole = player?.assigned_role;
  const isCustom = player?.assigned_custom_title != null;
  const roleDef = hasRole
    ? isCustom
      ? makeCustomRole()
      : getRoleByKey(player!.assigned_role!)
    : null;

  // Waiting state — only show if the player has NOT yet received a role.
  // Once assigned_role is set, we move forward regardless of room status timing.
  if (!hasRole) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-lg font-semibold text-moon-200">
                {player?.name}
              </h1>
              <p className="text-[11px] text-ash-400">{t('joinGame')}</p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="w-9 h-9 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-300 transition-all hover:border-blood-600/40 hover:text-blood-400 active:scale-95"
          >
            <LogOut className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 blur-3xl bg-moon-500/10 rounded-full" />
            <Hourglass className="relative w-16 h-16 text-moon-400 animate-float" strokeWidth={1} />
          </div>
          <p className="text-sm text-ash-300 animate-pulse">{t('waitingForDeal')}</p>
          <div className="mt-4 flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-moon-500 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-moon-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-moon-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Dealing in progress
  if (status === 'dealing') {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-gold-400 animate-spin mb-4" />
        <p className="text-sm text-gold-200">{t('hostIsDealing')}</p>
      </div>
    );
  }

  if (!roleDef || !player) return null;

  const Icon = roleDef.icon;
  const roleTitle = isCustom ? player.assigned_custom_title! : tRole(roleDef.key);
  const roleDesc = isCustom ? (player.assigned_custom_description || '') : tRoleDesc(roleDef.key);

  return (
    <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-lg font-semibold text-gold-200">{player.name}</h1>
          <p className="text-[11px] text-ash-400">{t('yourRole')}</p>
        </div>
        <button
          onClick={handleLeave}
          className="w-9 h-9 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-300 transition-all hover:border-blood-600/40 hover:text-blood-400 active:scale-95"
        >
          <LogOut className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="perspective-1000 select-none"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className={`preserve-3d transition-transform duration-500 relative ${revealed ? 'rotate-y-180' : ''}`}
            style={{
              width: dir === 'rtl' ? '18rem' : '18rem',
              height: '26rem',
            }}
          >
            {/* Card Back (hidden when revealed) */}
            <div className="backface-hidden absolute inset-0">
              <div
                className={`w-full h-full rounded-3xl border-2 bg-gradient-to-br ${roleDef.gradient} border-mystery-500/40 overflow-hidden relative ${holding ? roleDef.glow : ''} transition-shadow duration-300`}
              >
                <div className="bg-card-grain absolute inset-0" />

                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px),
                                      radial-gradient(circle at 75% 75%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}
                />

                <div className="relative h-full flex flex-col items-center justify-center p-6 no-select">
                  <Moon className={`w-16 h-16 ${roleDef.accent} mb-4 ${holding ? 'animate-pulse' : 'animate-float'}`} strokeWidth={1} />

                  <div className="mt-4 text-center">
                    <p className="text-sm font-display font-semibold text-ash-200 mb-2">
                      {t('holdToReveal')}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-ash-400">
                      <Hand className="w-4 h-4" />
                      <span className="text-xs">{t('yourRole')}</span>
                    </div>
                  </div>

                  {/* Hold progress bar */}
                  {holding && (
                    <div className="absolute bottom-6 left-6 right-6 h-1 rounded-full bg-mystery-900/60 overflow-hidden">
                      <div
                        ref={progressRef}
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                        style={{
                          animation: 'holdProgress 0.6s linear forwards',
                        }}
                      />
                      <style>{`
                        @keyframes holdProgress {
                          from { width: 0%; }
                          to { width: 100%; }
                        }
                      `}</style>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Front (visible when revealed) */}
            <div className="backface-hidden rotate-y-180 absolute inset-0">
              <div
                className={`w-full h-full rounded-3xl border-2 bg-gradient-to-br ${roleDef.gradient} border-gold-500/40 overflow-hidden relative ${roleDef.glow}`}
              >
                <div className="bg-card-grain absolute inset-0" />

                {/* Corner flourishes */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold-400/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold-400/30 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold-400/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold-400/30 rounded-br-lg" />

                <div className="relative h-full flex flex-col items-center justify-between p-8 no-select">
                  {/* Icon */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative">
                      <div className={`absolute inset-0 blur-2xl ${roleDef.isWolf ? 'bg-blood-500/20' : 'bg-gold-500/20'} rounded-full`} />
                      <Icon className={`relative w-24 h-24 ${roleDef.accent}`} strokeWidth={1} />
                    </div>
                  </div>

                  {/* Role info */}
                  <div className="text-center w-full">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-ash-400 mb-2">
                      {t('yourRole')}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-ash-100 mb-3 leading-tight">
                      {roleTitle}
                    </h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent mx-auto mb-3" />
                    <p className="text-xs text-ash-300 leading-relaxed px-2">
                      {roleDesc}
                    </p>
                  </div>

                  {/* Privacy indicator */}
                  <div className="mt-4 flex items-center gap-1.5 text-ash-500">
                    <EyeOff className="w-3 h-3" />
                    <span className="text-[10px]">{t('releaseToHide')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status below card */}
        <div className="mt-8 text-center">
          {seenOnce ? (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-forest-500">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">{t('seenByPlayer')}</span>
              </div>
              <p className="text-[11px] text-ash-400">{t('releaseToHide')}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-ash-400">
              <Hand className="w-4 h-4" />
              <span className="text-xs">{t('holdToReveal')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
