import React, { useState, useEffect } from 'react';
import { DefiProvider, useDefi } from './context/DefiContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { RankingTable } from './components/RankingTable';
import { CalendarView } from './components/CalendarView';
import { PlayerDirectory } from './components/PlayerDirectory';
import { MyMatches } from './components/MyMatches';
import { MatchArchive } from './components/MatchArchive';
import { PlayoffView } from './components/PlayoffView';
import { RulesGuide } from './components/RulesGuide';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { ChallengeModal } from './components/ChallengeModal';
import { ScoreModal } from './components/ScoreModal';
import { ReportModal } from './components/ReportModal';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { ExcuseModal } from './components/ExcuseModal';
import { Player, Match } from './types/defi';
import { CheckCircle, AlertCircle, Info, Trophy } from 'lucide-react';

function DefiAppContent() {
  const { toast, isAdmin, currentUser, theme } = useDefi();

  const [activeTab, setActiveTab] = useState<string>('ranking');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'player' | 'admin'>('player');
  const [preselectedPlayerId, setPreselectedPlayerId] = useState<string | undefined>(undefined);

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [challengeTargetPlayer, setChallengeTargetPlayer] = useState<Player | null>(null);
  const [scoreTargetMatch, setScoreTargetMatch] = useState<Match | null>(null);
  const [selectedDetailPlayer, setSelectedDetailPlayer] = useState<Player | null>(null);
  const [excuseTargetPlayer, setExcuseTargetPlayer] = useState<Player | null>(null);

  const isLoggedIn = !!currentUser || isAdmin;
  const isLight = theme === 'light';

  // Sync activeTab when logging in or out
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin');
    } else if (currentUser) {
      setActiveTab('ranking');
    }
  }, [isAdmin, currentUser?.id]);

  const handleOpenChallenge = (player: Player) => {
    setChallengeTargetPlayer(player);
  };

  const handleOpenScore = (match: Match) => {
    setScoreTargetMatch(match);
  };

  const handleSelectPlayerDetail = (player: Player) => {
    setSelectedDetailPlayer(player);
  };

  const openLogin = (mode: 'player' | 'admin' = 'player', playerId?: string) => {
    setLoginMode(mode);
    setPreselectedPlayerId(playerId);
    setIsLoginModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      isLight
        ? 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white'
        : 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950'
    }`}>
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLoginModal={(mode) => openLogin(mode || 'player')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {!isLoggedIn ? (
          /* ANASAYFA / GİRİŞ EKRANI: Sadece Kadın & Erkek Sıralaması, Oyuncu ve Yönetici Girişi */
          <LandingPage
            onOpenPlayerLogin={(playerId) => openLogin('player', playerId)}
            onOpenAdminLogin={() => openLogin('admin')}
          />
        ) : (
          /* ÜYE & YÖNETİCİ MODU: Giriş yapıldığında tüm sekmeler erişilebilir */
          <>
            {activeTab === 'admin' && (
              isAdmin ? (
                <AdminPanel
                  onOpenScoreModal={handleOpenScore}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3">
                  <h3 className="text-base font-bold text-white">Yönetici Yetkisi Gerekli</h3>
                  <p className="text-xs text-slate-400">
                    Bu alana yalnızca Defi Komitesi ve yöneticiler erişebilir.
                  </p>
                  <button
                    onClick={() => openLogin('admin')}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Yönetici Girişi Yap
                  </button>
                </div>
              )
            )}

            {activeTab === 'ranking' && (
              <RankingTable
                onChallengePlayer={handleOpenChallenge}
                onSelectPlayerDetail={handleSelectPlayerDetail}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                onOpenScoreModal={handleOpenScore}
                onOpenChallengeModal={handleOpenChallenge}
              />
            )}

            {/* Oyuncular sekmesi kaldırıldı - Sıralamadaki oyuncuya tıklandığında PlayerDetailModal açılmaktadır */}

            {activeTab === 'my_matches' && (
              <MyMatches
                onOpenScoreModal={handleOpenScore}
                onOpenLoginModal={() => openLogin('player')}
              />
            )}

            {activeTab === 'archive' && (
              <MatchArchive onOpenScoreModal={handleOpenScore} />
            )}

            {activeTab === 'playoff' && <PlayoffView />}

            {activeTab === 'rules' && <RulesGuide />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-xs print:hidden transition-colors ${
        isLight
          ? 'border-slate-200 bg-white text-slate-600'
          : 'border-slate-800/80 bg-slate-900/60 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Zonguldak Tenis Deniz Spor Kulübü</span>
              <span className="text-slate-400 ml-2 hidden sm:inline">1951'den Günümüze Tenis Kültürü</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Defi Koordinatörü: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>Vahit Bergin</strong></span>
            {isLoggedIn && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="hover:text-amber-500 underline cursor-pointer"
                >
                  Resmi Rapor
                </button>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('rules')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 underline cursor-pointer"
                >
                  17 Maddelik Talimatname
                </button>
              </>
            )}
            <span>•</span>
            <span className="text-slate-500">ZTDSK Resmi Defi Portalı</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={loginMode}
        preselectedPlayerId={preselectedPlayerId}
      />

      <ChallengeModal
        isOpen={!!challengeTargetPlayer}
        onClose={() => setChallengeTargetPlayer(null)}
        targetPlayer={challengeTargetPlayer}
        onOpenLogin={() => openLogin('player')}
      />

      <ScoreModal
        isOpen={!!scoreTargetMatch}
        onClose={() => setScoreTargetMatch(null)}
        match={scoreTargetMatch}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <PlayerDetailModal
        player={selectedDetailPlayer}
        isOpen={!!selectedDetailPlayer}
        onClose={() => setSelectedDetailPlayer(null)}
        onOpenChallenge={handleOpenChallenge}
        onOpenExcuseModal={(player) => {
          setSelectedDetailPlayer(null);
          setExcuseTargetPlayer(player);
        }}
      />

      {excuseTargetPlayer && (
        <ExcuseModal
          player={excuseTargetPlayer}
          isOpen={!!excuseTargetPlayer}
          onClose={() => setExcuseTargetPlayer(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 p-3.5 rounded-xl shadow-2xl border text-xs max-w-sm animate-fade-in bg-slate-900 text-white border-slate-700">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span className="leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DefiProvider>
      <DefiAppContent />
    </DefiProvider>
  );
}
