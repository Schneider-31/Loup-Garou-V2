import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { loadSession, saveSession, clearSession, type Session } from '@/lib/session';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { HomeScreen } from '@/screens/HomeScreen';
import { HostSetupScreen } from '@/screens/HostSetupScreen';
import { HostDashboardScreen } from '@/screens/HostDashboardScreen';
import { PlayerJoinScreen } from '@/screens/PlayerJoinScreen';
import { PlayerCardScreen } from '@/screens/PlayerCardScreen';
import type { AppScreen } from '@/types';

// Checks that the saved room / player still exists in the database.
// Throws on network errors so we never delete a good session by mistake.
async function sessionStillExists(s: Session): Promise<boolean> {
  if (s.role === 'host') {
    const { data, error } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', s.roomId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }
  const { data, error } = await supabase
    .from('players')
    .select('id')
    .eq('id', s.playerId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

function screenForSession(s: Session): AppScreen {
  return s.role === 'host'
    ? { name: 'hostDashboard', roomId: s.roomId }
    : { name: 'playerCard', roomId: s.roomId, playerId: s.playerId };
}

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>({ name: 'home' });
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [restoring, setRestoring] = useState<boolean>(() => loadSession() !== null);

  // Always re-read the saved session: the host/player screens clear it
  // themselves when the room is closed or the player leaves.
  const goHome = () => {
    setScreen({ name: 'home' });
    setSession(loadSession());
  };

  // On first load, go straight back to the room / card we were in.
  useEffect(() => {
    const saved = loadSession();
    if (!saved) {
      setRestoring(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const ok = await sessionStillExists(saved);
        if (cancelled) return;
        if (ok) {
          setScreen(screenForSession(saved));
        } else {
          clearSession();
          setSession(null);
        }
      } catch {
        // Network problem: keep the session, the Home screen offers a resume button.
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResume = async () => {
    if (!session) return;
    try {
      const ok = await sessionStillExists(session);
      if (ok) {
        setScreen(screenForSession(session));
      } else {
        clearSession();
        setSession(null);
      }
    } catch {
      /* network problem: stay on Home, the user can try again */
    }
  };

  return (
    <div className="min-h-screen bg-mystery-radial">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-moon-900/10 blur-3xl" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 rounded-full bg-blood-900/10 blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-48 h-48 rounded-full bg-gold-900/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <TopNav />

        <main>
          {restoring && (
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
            </div>
          )}

          {!restoring && screen.name === 'home' && (
            <HomeScreen
              onHost={() => setScreen({ name: 'hostSetup' })}
              onJoin={() => setScreen({ name: 'playerJoin' })}
              resume={session ? { kind: session.role, onResume: handleResume } : undefined}
            />
          )}

          {screen.name === 'hostSetup' && (
            <HostSetupScreen
              onBack={goHome}
              onRoomCreated={(roomId) => {
                const next: Session = { role: 'host', roomId };
                saveSession(next);
                setSession(next);
                setScreen({ name: 'hostDashboard', roomId });
              }}
            />
          )}

          {screen.name === 'hostDashboard' && (
            <HostDashboardScreen
              roomId={screen.roomId}
              onBack={goHome}
            />
          )}

          {screen.name === 'playerJoin' && (
            <PlayerJoinScreen
              onBack={goHome}
              onJoined={(roomId, playerId) => {
                const next: Session = { role: 'player', roomId, playerId };
                saveSession(next);
                setSession(next);
                setScreen({ name: 'playerCard', roomId, playerId });
              }}
            />
          )}

          {screen.name === 'playerCard' && (
            <PlayerCardScreen
              roomId={screen.roomId}
              playerId={screen.playerId}
              onLeave={goHome}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
