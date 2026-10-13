// Remembers who this device is (host of a room, or a player) so that a page
// refresh or an accidental app close does not lose the room / the card.
// Stored only in this browser (localStorage). Contains no secrets, only ids.

export type Session =
  | { role: 'host'; roomId: string }
  | { role: 'player'; roomId: string; playerId: string };

const KEY = 'wg-session';

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s && s.role === 'host' && typeof s.roomId === 'string') {
      return { role: 'host', roomId: s.roomId };
    }
    if (
      s &&
      s.role === 'player' &&
      typeof s.roomId === 'string' &&
      typeof s.playerId === 'string'
    ) {
      return { role: 'player', roomId: s.roomId, playerId: s.playerId };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable (private mode, etc.) - the app still works without it */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
