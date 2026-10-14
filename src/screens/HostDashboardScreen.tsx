import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { BUILTIN_ROLES, getRoleByKey } from '@/data/roles';
import type { Room, Player, RoleConfigEntry, GamePhase } from '@/types';
import {
  ArrowLeft,
  Users,
  Plus,
  Minus,
  Sparkles,
  Loader2,
  Shuffle,
  Check,
  X,
  Trash2,
  Copy,
  CheckCheck,
  Skull,
  HeartPulse,
} from 'lucide-react';
import { CustomRoleBuilder } from '@/components/CustomRoleBuilder';
import { GamePanel } from '@/components/GamePanel';
import { clearSession } from '@/lib/session';

interface HostDashboardScreenProps {
  roomId: string;
  onBack: () => void;
}

export function HostDashboardScreen({ roomId, onBack }: HostDashboardScreenProps) {
  const { t, tRole, tRoleDesc } = useLanguage();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roleConfig, setRoleConfig] = useState<RoleConfigEntry[]>([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [dealing, setDealing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [phaseBusy, setPhaseBusy] = useState(false);

  // Keep a ref to the latest roleConfig so rapid clicks don't read a stale snapshot.
  const roleConfigRef = useRef<RoleConfigEntry[]>([]);
  roleConfigRef.current = roleConfig;

  // Prevent double-deal from repeated button presses or race conditions.
  const dealingRef = useRef(false);

  // Debounce realtime-triggered reloads to avoid N+1 query storms when many
  // players join or get updated near-simultaneously.
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load room and subscribe to changes
  useEffect(() => {
    const loadRoom = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      if (data) {
        setRoom(data as Room);
        setRoleConfig((data as Room).role_config || []);
      }
    };
    loadRoom();

    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        if (payload.new) {
          setRoom(payload.new as Room);
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setTimeout(() => loadRoom(), 1000);
        }
      });

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId]);

  // Load players from the database.
  const loadPlayers = useCallback(async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });
    if (data) setPlayers(data as Player[]);
  }, [roomId]);

  // Debounced reload: coalesces bursts of realtime events into a single query.
  const debouncedReload = useCallback(() => {
    if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    reloadTimerRef.current = setTimeout(() => loadPlayers(), 300);
  }, [loadPlayers]);

  useEffect(() => {
    loadPlayers();

    const playersChannel = supabase
      .channel(`players-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        debouncedReload();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setTimeout(() => loadPlayers(), 1000);
        }
      });

    // Poll every 5s as a fallback for missed realtime events (reduced from 3s
    // to cut load when 25+ players are connected).
    const pollInterval = setInterval(loadPlayers, 5000);

    return () => {
      supabase.removeChannel(playersChannel);
      clearInterval(pollInterval);
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, [roomId, loadPlayers, debouncedReload]);

  const saveRoleConfig = useCallback(async (config: RoleConfigEntry[]) => {
    roleConfigRef.current = config;
    setRoleConfig(config);
    await supabase
      .from('rooms')
      .update({ role_config: config, updated_at: new Date().toISOString() })
      .eq('id', roomId);
  }, [roomId]);

  // Use the ref so rapid successive clicks always operate on the latest config.
  const adjustQuantity = (roleKey: string, delta: number) => {
    const current = roleConfigRef.current;
    const existing = current.find((r) => r.roleKey === roleKey);
    if (existing) {
      const newQty = Math.max(0, existing.quantity + delta);
      if (newQty === 0) {
        saveRoleConfig(current.filter((r) => r.roleKey !== roleKey));
      } else {
        saveRoleConfig(current.map((r) =>
          r.roleKey === roleKey ? { ...r, quantity: newQty } : r
        ));
      }
    } else if (delta > 0) {
      saveRoleConfig([...current, { roleKey, quantity: 1 }]);
    }
  };

  const removeCustomRole = (roleKey: string) => {
    saveRoleConfig(roleConfigRef.current.filter((r) => r.roleKey !== roleKey));
  };

  const addCustomRole = (entry: RoleConfigEntry) => {
    saveRoleConfig([...roleConfigRef.current, entry]);
  };

  const totalRoles = roleConfig.reduce((sum, r) => sum + r.quantity, 0);
  const playerCount = players.length;
  const canDeal = totalRoles === playerCount && playerCount > 0;

  const handleDeal = async () => {
    // Guard against double-deal from repeated presses or race conditions.
    if (dealingRef.current) return;

    // Re-read from ref to ensure we have the latest config at click time
    const currentConfig = roleConfigRef.current;
    const currentTotal = currentConfig.reduce((sum, r) => sum + r.quantity, 0);
    if (currentTotal !== players.length || players.length === 0) {
      setError(t('mismatchWarning'));
      return;
    }

    dealingRef.current = true;
    setDealing(true);
    setError('');

    try {
      // Set room status to 'dealing' so players see the dealing animation
      const { error: statusError } = await supabase
        .from('rooms')
        .update({ status: 'dealing', updated_at: new Date().toISOString() })
        .eq('id', roomId);
      if (statusError) throw statusError;

      // Build the deck of roles from the ref-verified config
      const deck: { roleKey: string; customTitle?: string; customDescription?: string }[] = [];
      for (const entry of currentConfig) {
        for (let i = 0; i < entry.quantity; i++) {
          deck.push({
            roleKey: entry.roleKey,
            customTitle: entry.customTitle,
            customDescription: entry.customDescription,
          });
        }
      }

      // Shuffle
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      // Single atomic server-side RPC call to assign all roles at once.
      // This replaces the previous sequential per-player update loop that
      // caused partial deals and timeouts with many players.
      const { error: rpcError } = await supabase.rpc('deal_cards', {
        p_room_id: roomId,
        p_deck: deck,
      });
      if (rpcError) throw rpcError;
    } catch (err) {
      console.error('DEAL ERROR:', err);
  setError(
    err instanceof Error ? err.message : JSON.stringify(err)
  );
      // Reset room status back to waiting so the deal button is usable again
      await supabase
        .from('rooms')
        .update({ status: 'waiting', updated_at: new Date().toISOString() })
        .eq('id', roomId);
    } finally {
      dealingRef.current = false;
      setDealing(false);
    }
  };

  const handleDealAgain = async () => {
    // Single atomic server-side RPC call to reset all role assignments.
    const { error: rpcError } = await supabase.rpc('reset_room', {
      p_room_id: roomId,
    });
    if (rpcError) {
      setError('Failed to reset room. Please try again.');
    }
  };

  const handleCloseRoom = async () => {
    await supabase.from('players').delete().eq('room_id', roomId);
    await supabase.from('rooms').delete().eq('id', roomId);
    clearSession();
    onBack();
  };

  // Lets the host remove a player (typo in the name, someone who left, etc.).
  const handleKick = async (playerId: string) => {
    if (!window.confirm(t('kickConfirm'))) return;
    const { error: kickError } = await supabase.from('players').delete().eq('id', playerId);
    if (kickError) {
      setError(kickError.message);
      return;
    }
    loadPlayers();
  };

  // Night / day switch. The room row is shared in real time, so every player's
  // phone shows the change as soon as it is saved.
  const handleSetPhase = async (phase: GamePhase, round: number) => {
    if (!room || phaseBusy) return;
    setPhaseBusy(true);
    setError('');
    const previous = room;
    setRoom({ ...room, phase, round_number: round });
    const { error: phaseError } = await supabase
      .from('rooms')
      .update({ phase, round_number: round, updated_at: new Date().toISOString() })
      .eq('id', roomId);
    if (phaseError) {
      setRoom(previous);
      setError(phaseError.message);
    }
    setPhaseBusy(false);
  };

  // Mark a player as eliminated (or bring him back after a mistake).
  const handleToggleAlive = async (player: Player) => {
    const nextAlive = !player.is_alive;
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, is_alive: nextAlive } : p)));
    const { error: aliveError } = await supabase
      .from('players')
      .update({ is_alive: nextAlive, updated_at: new Date().toISOString() })
      .eq('id', player.id);
    if (aliveError) {
      setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, is_alive: !nextAlive } : p)));
      setError(aliveError.message);
    }
  };

  const copyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDealt = room?.status === 'dealt';

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-300 transition-all hover:border-gold-500/40 hover:text-gold-300 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <h1 className="font-display text-lg font-semibold text-gold-200">{t('hostGame')}</h1>
      </div>

      {/* Room Code Card */}
      {room && (
        <div className="mb-6 rounded-2xl border border-gold-700/30 bg-gradient-to-br from-mystery-800 to-mystery-900 p-5 text-center relative overflow-hidden">
          <div className="bg-card-grain absolute inset-0 opacity-50" />
          <div className="relative">
            <p className="text-xs text-ash-300 mb-2">{t('shareCode')}</p>
            <button
              onClick={copyCode}
              className="group inline-flex items-center gap-3 rounded-xl bg-mystery-950/60 border border-gold-600/30 px-6 py-3 transition-all hover:border-gold-500/50 active:scale-95"
            >
              <span className="font-display text-3xl font-bold tracking-[0.3em] text-gradient-gold">
                {room.code}
              </span>
              {copied ? (
                <CheckCheck className="w-4 h-4 text-forest-500" />
              ) : (
                <Copy className="w-4 h-4 text-ash-400 group-hover:text-gold-300" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Host tools: night/day, counters, night guide */}
      {room && isDealt && (
        <GamePanel room={room} players={players} busy={phaseBusy} onSetPhase={handleSetPhase} />
      )}

      {/* Players section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-moon-400" />
            <h2 className="text-sm font-semibold text-ash-200">{t('playersJoined')}</h2>
          </div>
          <span className="text-xs text-ash-400">{t('playersCount').replace('{count}', String(playerCount))}</span>
        </div>

        {playerCount === 0 ? (
          <div className="rounded-xl border border-dashed border-mystery-600/50 bg-mystery-800/30 p-6 text-center">
            <p className="text-xs text-ash-400">{t('noPlayersYet')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player, idx) => {
              const hasRole = isDealt && player.assigned_role;
              const roleDef = hasRole ? getRoleByKey(player.assigned_role!) : null;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-xl border border-mystery-700/50 bg-mystery-800/40 p-3 animate-fade-in ${
                    isDealt && !player.is_alive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-mystery-700/60 border border-mystery-600/40 flex items-center justify-center text-xs font-semibold text-ash-300">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        isDealt && !player.is_alive ? 'text-ash-400 line-through' : 'text-ash-100'
                      }`}
                    >
                      {player.name}
                    </p>
                    {hasRole && (
                      <p className="text-[10px] text-ash-400 truncate">
                        {player.assigned_custom_title != null
                          ? player.assigned_custom_title
                          : tRole(player.assigned_role!)}
                      </p>
                    )}
                  </div>
                  {hasRole ? (
                    <span className="text-xs text-ash-400">
                      {player.has_seen_card ? (
                        <Check className="w-4 h-4 text-forest-500" />
                      ) : (
                        <span className="text-ash-500">•••</span>
                      )}
                    </span>
                  ) : null}
                  {roleDef && (
                    <span className={`text-xs ${roleDef.accent}`}>
                      {roleDef.icon && <roleDef.icon className="w-3.5 h-3.5" />}
                    </span>
                  )}
                  {isDealt ? (
                    <button
                      onClick={() => handleToggleAlive(player)}
                      title={player.is_alive ? t('eliminate') : t('revive')}
                      aria-label={player.is_alive ? t('eliminate') : t('revive')}
                      className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${
                        player.is_alive
                          ? 'border-blood-800/40 bg-blood-900/20 text-blood-300 hover:bg-blood-900/40'
                          : 'border-forest-600/40 bg-forest-800/20 text-forest-500 hover:bg-forest-800/40'
                      }`}
                    >
                      {player.is_alive ? (
                        <Skull className="w-4 h-4" />
                      ) : (
                        <HeartPulse className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleKick(player.id)}
                      title={t('kickPlayer')}
                      aria-label={t('kickPlayer')}
                      className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-ash-500 transition-all hover:text-blood-300 hover:bg-blood-900/30 active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role selection */}
      {!isDealt && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-ash-200">{t('selectRoles')}</h2>
              <p className="text-[11px] text-ash-400 mt-0.5">{t('selectRolesDesc')}</p>
            </div>
            <button
              onClick={() => setShowCustomBuilder(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gold-700/40 bg-gold-900/20 px-3 py-1.5 text-xs font-medium text-gold-300 transition-all hover:bg-gold-900/40 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('addCustomRole')}</span>
            </button>
          </div>

          <div className="space-y-2">
            {BUILTIN_ROLES.map((role) => {
              const config = roleConfig.find((r) => r.roleKey === role.key);
              const qty = config?.quantity || 0;
              const Icon = role.icon;
              return (
                <div
                  key={role.key}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    qty > 0
                      ? `border-${role.accent.replace('text-', '')}/30 bg-mystery-800/50`
                      : 'border-mystery-700/40 bg-mystery-800/20'
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-ash-100" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ash-100">{tRole(role.key)}</p>
                    <p className="text-[10px] text-ash-400 truncate">{tRoleDesc(role.key)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustQuantity(role.key, -1)}
                      disabled={qty === 0}
                      className="w-8 h-8 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-200 transition-all hover:border-gold-500/40 active:scale-95 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-gold-200">{qty}</span>
                    <button
                      onClick={() => adjustQuantity(role.key, 1)}
                      className="w-8 h-8 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-200 transition-all hover:border-gold-500/40 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Custom roles */}
            {roleConfig.filter((r) => r.customTitle).map((role) => (
              <div
                key={role.roleKey}
                className="flex items-center gap-3 rounded-xl border border-gold-700/30 bg-gold-900/10 p-3"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gold-800 to-gold-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold-200" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gold-200">{role.customTitle}</p>
                  {role.customDescription && (
                    <p className="text-[10px] text-ash-400 truncate">{role.customDescription}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustQuantity(role.roleKey, -1)}
                    className="w-8 h-8 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-200 transition-all hover:border-gold-500/40 active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-gold-200">{role.quantity}</span>
                  <button
                    onClick={() => adjustQuantity(role.roleKey, 1)}
                    className="w-8 h-8 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-200 transition-all hover:border-gold-500/40 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeCustomRole(role.roleKey)}
                    className="w-8 h-8 rounded-lg border border-blood-800/40 bg-blood-900/20 flex items-center justify-center text-blood-400 transition-all hover:bg-blood-900/40 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary and Deal */}
      <div className="sticky bottom-16 pt-2">
        {error && <p className="text-xs text-blood-400 text-center mb-2 animate-fade-in">{error}</p>}

        {!isDealt && (
          <div className="mb-3 text-center">
            <p className={`text-xs ${canDeal ? 'text-forest-500' : 'text-ash-400'}`}>
              {t('roleCount')
                .replace('{roles}', String(totalRoles))
                .replace('{players}', String(playerCount))}
            </p>
            {!canDeal && totalRoles !== playerCount && playerCount > 0 && (
              <p className="text-[11px] text-blood-400 mt-1">{t('mismatchWarning')}</p>
            )}
          </div>
        )}

        {!isDealt ? (
          <button
            onClick={handleDeal}
            disabled={!canDeal || dealing}
            className="w-full rounded-xl border border-gold-600/40 bg-gradient-to-r from-gold-800 to-gold-700 px-4 py-3.5 text-sm font-semibold text-gold-100 transition-all hover:from-gold-700 hover:to-gold-600 hover:glow-gold active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {dealing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('dealing')}
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4" />
                {t('dealCards')}
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl border border-forest-600/30 bg-forest-800/20 p-3 text-center">
              <p className="text-sm font-semibold text-forest-500 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {t('cardsDealt')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDealAgain}
                className="flex-1 rounded-xl border border-mystery-600/60 bg-mystery-800/50 px-4 py-3 text-sm font-medium text-ash-200 transition-all hover:border-gold-500/40 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                {t('dealAgain')}
              </button>
              <button
                onClick={handleCloseRoom}
                className="rounded-xl border border-blood-800/40 bg-blood-900/20 px-4 py-3 text-sm font-medium text-blood-400 transition-all hover:bg-blood-900/40 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCustomBuilder && (
        <CustomRoleBuilder onAdd={addCustomRole} onClose={() => setShowCustomBuilder(false)} />
      )}
    </div>
  );
}
