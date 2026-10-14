import React from 'react';
import { useDefi } from '../context/DefiContext';
import { Trophy, Calendar, Users, Shield, LogIn, LogOut, CheckCircle, Bell, Award, BookOpen, User, Flame } from 'lucide-react';
import { Category } from '../types/defi';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openLoginModal }) => {
  const {
    currentCategory,
    setCurrentCategory,
    currentUser,
    isAdmin,
    logout,
    players,
    matches,
    settings,
  } = useDefi();

  const menCount = players.filter((p) => p.category === 'men').length;
  const womenCount = players.filter((p) => p.category === 'women').length;

  // Pending actions for current user
  const pendingConfirmationMatches = currentUser
    ? matches.filter(
        (m) =>
          m.status === 'score_submitted' &&
          m.score?.loserId === currentUser.id
      )
    : [];

  const pendingScoreEntryMatches = currentUser
    ? matches.filter(
        (m) =>
          m.status === 'scheduled' &&
          (m.challengerId === currentUser.id || m.defenderId === currentUser.id) &&
          new Date(m.matchDate) <= new Date('2026-10-14')
      )
    : [];

  const totalUserAlerts = pendingConfirmationMatches.length + pendingScoreEntryMatches.length;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Club Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400 uppercase tracking-wider">
              {settings.clubName}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">Kuruluş 1951</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-amber-300 font-medium hidden md:inline">
              Defi Koordinatörü: {settings.coordinatorName}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden lg:inline text-slate-400">
              Lig Sezonu: <strong className="text-slate-200">05 Eki 2026 – 21 Şub 2027</strong>
            </span>
            <span className="bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              Bugün: 14 Ekim 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/40 shrink-0">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  DEFİ LİGİ
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                    2026 - 2027
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                14(+) Tek Erkekler & 14(+) Tek Kadınlar Resmi Sıralama & Skor Portalı
              </p>
            </div>
          </div>

          {/* Center Category Selector */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start md:self-center">
            <button
              onClick={() => setCurrentCategory('men')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                currentCategory === 'men'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>14(+) Tek Erkekler</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentCategory === 'men' ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {menCount}
              </span>
            </button>
            <button
              onClick={() => setCurrentCategory('women')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                currentCategory === 'women'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>14(+) Tek Kadınlar</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentCategory === 'women' ? 'bg-rose-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {womenCount}
              </span>
            </button>
          </div>

          {/* User Status / Login Actions */}
          <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
                <div className={`w-8 h-8 rounded-lg ${currentUser.avatarBg || 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                  {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 rounded font-bold">
                      #{currentUser.rank}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser.wins}G / {currentUser.losses}M
                  </div>
                </div>

                {totalUserAlerts > 0 && (
                  <button
                    onClick={() => setActiveTab('my_matches')}
                    className="relative ml-1 p-1.5 text-amber-400 bg-amber-950/60 rounded-lg hover:bg-amber-900/60 transition"
                    title="İşlem bekleyen maçınız var!"
                  >
                    <Bell className="w-4 h-4 animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalUserAlerts}
                    </span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition ml-1"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-2.5 bg-amber-950/50 border border-amber-600/50 rounded-xl px-3 py-1.5">
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-left text-xs">
                  <div className="font-bold text-amber-300">Yönetici Modu</div>
                  <div className="text-[10px] text-amber-400/80">Defi Komitesi</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-amber-400/70 hover:text-rose-400 transition ml-1"
                  title="Yönetici Çıkışı"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Oyuncu / Yönetici Girişi</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-800/80 mt-3 no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ranking'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Defi Sıralaması</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Takvim & Günün Maçları</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'players'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Oyuncular</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveTab('my_matches')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 relative ${
                activeTab === 'my_matches'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Maçlarım & Skor Girişi</span>
              {totalUserAlerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'archive'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Maç Sonuçları Arşivi</span>
          </button>

          <button
            onClick={() => setActiveTab('playoff')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'playoff'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Play-Off Formatı (İlk 12)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Lig Kuralları (17 Madde)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ml-auto ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/40'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Yönetim Paneli</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
