import React from 'react';
import { useDefi } from '../context/DefiContext';
import {
  Trophy,
  Calendar,
  Users,
  Shield,
  LogIn,
  LogOut,
  CheckCircle,
  Bell,
  Award,
  BookOpen,
  User,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import { ClubLogo } from './ClubLogo';
import { AppQRCode } from './AppQRCode';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openLoginModal: (mode?: 'player' | 'admin') => void;
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
    theme,
    toggleTheme,
    isFirestoreConnected,
  } = useDefi();

  const isLight = theme === 'light';
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

  const hasActiveScheduledMatch = currentUser
    ? matches.some(
        (m) =>
          (m.challengerId === currentUser.id || m.defenderId === currentUser.id) &&
          (m.status === 'scheduled' || m.status === 'score_submitted')
      )
    : false;

  const totalUserAlerts = pendingConfirmationMatches.length + pendingScoreEntryMatches.length;
  const isLoggedIn = !!currentUser || isAdmin;

  return (
    <header className={`border-b sticky top-0 z-40 transition-colors backdrop-blur-md ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
    }`}>
      {/* Top Club Bar in ZTDSK Mavi & Beyaz */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white border-b border-blue-950/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-bold text-blue-300 uppercase tracking-wider">
              {settings.clubName}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-100/80 font-medium hidden sm:inline">Kuruluş 1951</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-emerald-300 font-medium hidden md:inline">
              Defi Koordinatörü: {settings.coordinatorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="hidden lg:inline text-slate-300">
              Lig Sezonu: <strong className="text-white">05 Eki 2026 – 21 Şub 2027</strong>
            </span>
            <span className="bg-blue-900/70 border border-blue-400/30 text-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Bugün: 14 Ekim 2026
            </span>
            <span
              className={`border px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition ${
                isFirestoreConnected
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-blue-950/80 border-blue-600/40 text-blue-300'
              }`}
              title="Tüm telefonlar ve bilgisayarlar anlık olarak tek bir merkezi bulut veritabanında senkronizedir."
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFirestoreConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
              <span>{isFirestoreConnected ? 'Canlı Bulut Veritabanı Aktif' : 'Bulut Senkronize Ediliyor'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title with Official ZTDSK Crest */}
          <div
            onClick={() => {
              if (isLoggedIn) {
                setActiveTab(isAdmin ? 'admin' : 'ranking');
              }
            }}
            className={`flex items-center gap-3.5 ${isLoggedIn ? 'cursor-pointer' : ''}`}
          >
            <div className="shrink-0 drop-shadow-sm hover:scale-105 transition-transform">
              <ClubLogo size={48} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  <span className={isLight ? 'text-blue-950' : 'text-white'}>ZTDSK DEFİ LİGİ</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    isLight ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}>
                    2026 - 2027
                  </span>
                </h1>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                14(+) Tek Erkekler & 14(+) Tek Kadınlar Resmi Sıralama & Skor Portalı
              </p>
            </div>
          </div>

          {/* Center Category Selector (Visible when logged in) */}
          {isLoggedIn && (
            <div className={`flex items-center p-1 rounded-xl border self-start md:self-center text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <button
                onClick={() => setCurrentCategory('men')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  currentCategory === 'men'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>14(+) Tek Erkekler</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  currentCategory === 'men' ? 'bg-emerald-800 text-white' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  {menCount}
                </span>
              </button>
              <button
                onClick={() => setCurrentCategory('women')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  currentCategory === 'women'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>14(+) Tek Kadınlar</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  currentCategory === 'women' ? 'bg-rose-800 text-white' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  {womenCount}
                </span>
              </button>
            </div>
          )}

          {/* Actions & User Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-end md:self-auto">
            {/* Quick Mobile Entry QR Code */}
            <AppQRCode variant="button_only" />

            {/* Day / Night Theme Button in Header */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title={isLight ? 'Gece Moduna Geç' : 'Gündüz Moduna Geç'}
            >
              {isLight ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" />
              )}
            </button>

            {currentUser ? (
              <div className={`flex items-center gap-2.5 border rounded-xl px-3 py-1.5 ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/80 border-slate-700/80'
              }`}>
                <div className={`w-8 h-8 rounded-lg ${currentUser.avatarBg || 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                  {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-1 rounded font-bold">
                      #{currentUser.rank}
                    </span>
                    {currentUser.isExcused && (
                      <span
                        className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold"
                        title={currentUser.excuseReason || 'Mazeret İzinli'}
                      >
                        ⏸️ Mazeretli
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {currentUser.wins}G / {currentUser.losses}M
                  </div>
                </div>

                {totalUserAlerts > 0 && (
                  <button
                    onClick={() => setActiveTab('my_matches')}
                    className="relative ml-1 p-1.5 text-amber-500 bg-amber-100 dark:bg-amber-950/60 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 transition cursor-pointer"
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
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition ml-1 cursor-pointer"
                  title="Oturumu Kapat"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-2.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/60 rounded-xl px-3 py-1.5">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-left text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-300">Yönetici Modu</div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-300/80">Defi Komitesi</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-amber-700 hover:text-rose-600 dark:text-amber-400/80 dark:hover:text-rose-400 transition ml-1 cursor-pointer"
                  title="Yönetici Çıkışı"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openLoginModal('player')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Oyuncu Girişi</span>
                </button>
                <button
                  onClick={() => openLoginModal('admin')}
                  className={`font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                    isLight
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-600/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">Yönetici</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs - ONLY visible when user or admin is logged in! */}
        {isLoggedIn && (
          <nav className={`flex items-center gap-1 overflow-x-auto pt-3 border-t mt-3 no-scrollbar text-xs ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1.5 mr-1 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isLight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-600/50 hover:bg-amber-900/40'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Yönetim Paneli</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Defi Sıralaması</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Takvim & Günün Maçları</span>
            </button>

            {/* Note: Oyuncular sekmesi kullanıcı talebiyle kaldırıldı - Sıralamadaki oyuncuya tıklandığında detayları açılıyor */}

            {currentUser && (
              <button
                onClick={() => setActiveTab('my_matches')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-2 relative ${
                  hasActiveScheduledMatch
                    ? 'animate-pulse ring-2 ring-amber-400 bg-amber-500/25 text-amber-300 font-bold shadow-lg shadow-amber-500/20'
                    : activeTab === 'my_matches'
                    ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Maçlarım & Skor Girişi</span>
                {hasActiveScheduledMatch ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    <span>Aktif Maç!</span>
                  </span>
                ) : totalUserAlerts > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                ) : null}
              </button>
            )}

            <button
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'archive'
                  ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Maç Sonuçları Arşivi</span>
            </button>

            <button
              onClick={() => setActiveTab('playoff')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'playoff'
                  ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Play-Off Formatı (İlk 12)</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'rules'
                  ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Lig Kuralları (17 Madde)</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
