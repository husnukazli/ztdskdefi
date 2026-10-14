import React, { useState } from 'react';
import { DefiProvider, useDefi } from './context/DefiContext';
import { Header } from './components/Header';
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
import { Player, Match } from './types/defi';
import { CheckCircle, AlertCircle, Info, Trophy, Heart } from 'lucide-react';

function DefiAppContent() {
  const { toast, isAdmin, currentUser } = useDefi();

  const [activeTab, setActiveTab] = useState<string>('ranking');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [challengeTargetPlayer, setChallengeTargetPlayer] = useState<Player | null>(null);
  const [scoreTargetMatch, setScoreTargetMatch] = useState<Match | null>(null);
  const [selectedProfilePlayer, setSelectedProfilePlayer] = useState<Player | null>(null);

  const handleOpenChallenge = (player: Player) => {
    setChallengeTargetPlayer(player);
  };

  const handleOpenScore = (match: Match) => {
    setScoreTargetMatch(match);
  };

  const handleSelectPlayerDetail = (player: Player) => {
    setSelectedProfilePlayer(player);
    setActiveTab('players');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
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

        {activeTab === 'players' && (
          <PlayerDirectory
            onChallengePlayer={handleOpenChallenge}
            selectedPlayer={selectedProfilePlayer}
            setSelectedPlayer={setSelectedProfilePlayer}
          />
        )}

        {activeTab === 'my_matches' && (
          <MyMatches
            onOpenScoreModal={handleOpenScore}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'archive' && (
          <MatchArchive onOpenScoreModal={handleOpenScore} />
        )}

        {activeTab === 'playoff' && <PlayoffView />}

        {activeTab === 'rules' && <RulesGuide />}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel onOpenScoreModal={handleOpenScore} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3">
              <h3 className="text-base font-bold text-white">Yönetici Yetkisi Gerekli</h3>
              <p className="text-xs text-slate-400">
                Bu alana yalnızca Defi Komitesi ve yöneticiler erişebilir.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Yönetici Girişi Yap
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-slate-950 font-bold flex items-center justify-center text-xs">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="font-bold text-slate-200">Zonguldak Tenis Deniz Spor Kulübü</span>
              <span className="text-slate-500 ml-2">1951'den Günümüze Tenis Kültürü</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Defi Koordinatörü: <strong className="text-slate-200">Vahit Bergin</strong></span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('rules')}
              className="hover:text-emerald-400 underline cursor-pointer"
            >
              17 Maddelik Talimatname
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-amber-400 underline cursor-pointer"
            >
              {isAdmin ? 'Yönetici' : currentUser ? currentUser.name : 'Giriş Yap'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ChallengeModal
        isOpen={!!challengeTargetPlayer}
        onClose={() => setChallengeTargetPlayer(null)}
        targetPlayer={challengeTargetPlayer}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <ScoreModal
        isOpen={!!scoreTargetMatch}
        onClose={() => setScoreTargetMatch(null)}
        match={scoreTargetMatch}
      />

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
