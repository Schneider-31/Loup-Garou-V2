import { useState } from 'react';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { HomeScreen } from '@/screens/HomeScreen';
import { HostSetupScreen } from '@/screens/HostSetupScreen';
import { HostDashboardScreen } from '@/screens/HostDashboardScreen';
import { PlayerJoinScreen } from '@/screens/PlayerJoinScreen';
import { PlayerCardScreen } from '@/screens/PlayerCardScreen';
import type { AppScreen } from '@/types';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>({ name: 'home' });

  const goHome = () => setScreen({ name: 'home' });

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
          {screen.name === 'home' && (
            <HomeScreen
              onHost={() => setScreen({ name: 'hostSetup' })}
              onJoin={() => setScreen({ name: 'playerJoin' })}
            />
          )}

          {screen.name === 'hostSetup' && (
            <HostSetupScreen
              onBack={goHome}
              onRoomCreated={(roomId) => setScreen({ name: 'hostDashboard', roomId })}
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
              onJoined={(roomId, playerId) =>
                setScreen({ name: 'playerCard', roomId, playerId })
              }
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
