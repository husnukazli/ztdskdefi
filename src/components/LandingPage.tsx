import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Sun,
  Moon,
  Download,
  Bell,
  Sparkles,
  LogIn,
  Trash2,
} from 'lucide-react';
import { ClubLogo } from './ClubLogo';
import { AppQRCode } from './AppQRCode';
import { Match } from '../types/defi';
import { getCalendarEventDetails, downloadIcsFile } from '../utils/calendarHelper';

interface LandingPageProps {
  onOpenPlayerLogin: (playerId?: string) => void;
  onOpenAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenPlayerLogin,
  onOpenAdminLogin,
}) => {
  const { players, matches, settings, theme, toggleTheme, showToast, isAdmin, deleteMatch } = useDefi();
  const [activeCategoryTab, setActiveCategoryTab] = useState<'both' | 'women' | 'men'>('both');
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  const isLight = theme === 'light';

  const womenPlayers = players
    .filter((p) => p.category === 'women')
    .sort((a, b) => a.rank - b.rank);

  const menPlayers = players
    .filter((p) => p.category === 'men')
    .sort((a, b) => a.rank - b.rank);

  // Chronologically sorted scheduled upcoming matches
  const scheduledMatches = matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => {
      const timeA = new Date(`${a.matchDate}T${a.matchTime || '12:00'}`).getTime();
      const timeB = new Date(`${b.matchDate}T${b.matchTime || '12:00'}`).getTime();
      return timeA - timeB;
    });

  const handleAddToCalendar = (match: Match) => {
    const p1 = players.find((p) => p.id === match.challengerId);
    const p2 = players.find((p) => p.id === match.defenderId);
    const p1Name = p1?.name || 'Meydan Okuyan';
    const p2Name = p2?.name || 'Savunan';

    const { googleCalendarUrl, prepTimeStr } = getCalendarEventDetails(match, p1Name, p2Name);

    // Open Google Calendar in new tab
    window.open(googleCalendarUrl, '_blank');
    showToast(
      `Google Ajanda açılıyor: Maç başlama saati ${match.matchTime || '18:00'}. Ajandanıza ısınma ve hazırlık için 1 saat öncesine (${prepTimeStr}) kaydedilecektir.`,
      'success'
    );
  };

  const handleDownloadIcs = (match: Match) => {
    const p1 = players.find((p) => p.id === match.challengerId);
    const p2 = players.find((p) => p.id === match.defenderId);
    downloadIcsFile(match, p1?.name || 'Meydan Okuyan', p2?.name || 'Savunan');
    showToast('Ajanda dosyası (.ics) indirildi. Telefonunuzun takvimine ekleyebilirsiniz.', 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Club Status Bar & Theme Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-colors ${
          isLight
            ? 'bg-blue-50 border-blue-200 text-blue-950'
            : 'bg-blue-950/70 border-blue-500/40 text-blue-200'
        }`}>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{settings.clubName} • Kuruluş 1951 • Kulüp Kortları: A, B ve C (Sert Kort)</span>
        </div>

        {/* Day / Night Theme Switcher */}
        <button
          onClick={toggleTheme}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 hover:text-blue-700'
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-blue-500'
          }`}
          title={isLight ? 'Gece Moduna Geç' : 'Gündüz Moduna Geç'}
        >
          {isLight ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Gündüz Modu (Ferah)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-400" />
              <span>Gece Modu</span>
            </>
          )}
        </button>
      </div>

      {/* Clean Hero Header with Official ZTDSK Crest in Mavi & Beyaz */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all shadow-sm ${
          isLight
            ? 'bg-gradient-to-br from-blue-50/90 via-white to-sky-50/70 border-blue-200 text-slate-900'
            : 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-950 border-blue-900 text-white'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>ZTDSK Kış Defi Ligi 2026 - 2027</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0 drop-shadow-md">
                <ClubLogo size={68} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-950 dark:text-white">
                  Zonguldak Tenis Deniz Spor Kulübü
                </h1>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  Türkiye'nin İlk İhtisas Tenis Kulübü • Mavi & Beyaz • Kuruluş 1951
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-700 font-normal' : 'text-slate-300'}`}>
              14(+) Tek Kadınlar ve 14(+) Tek Erkekler güncel defi sıralaması ile planlanmış maçlar aşağıda listelenmiştir.
              Maç teklifi göndermek ve skor girmek için sporcu adınızın yanındaki <strong>"Giriş"</strong> butonunu kullanabilirsiniz.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className={`px-3 py-1 rounded-lg border font-medium ${
                isLight ? 'bg-white border-blue-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                Defi Koordinatörü: <strong className={isLight ? 'text-blue-950' : 'text-white'}>{settings.coordinatorName}</strong>
              </span>
              <span className={`px-3 py-1 rounded-lg border font-medium ${
                isLight ? 'bg-white border-blue-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                Lig Sezonu: <strong className="text-emerald-600 dark:text-emerald-400">05 Ekim 2026 – 21 Şubat 2027</strong>
              </span>
              <span className={`px-3 py-1 rounded-lg border font-medium ${
                isLight ? 'bg-white border-blue-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                Kulüp Kortları: <strong className="text-blue-600 dark:text-blue-400">A, B ve C (Sert Kort)</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MOBİL GİRİŞ KAREKODU (TELEFON KAMERASI İLE TARAMA) */}
      <AppQRCode variant="card" />

      {/* PLANLANMIŞ MAÇLAR (TARİH SIRASINA GÖRE) & AJANDAMA EKLE (1 SAAT ÖNCESİNE) */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all shadow-sm ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Planlanmış Lig Maçları</span>
                <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-2 py-0.5 rounded-full font-bold">
                  {scheduledMatches.length} Maç
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Tarih ve saat sırasına göre yaklaşan karşılaşmalar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ajandaya maçtan 1 saat öncesine kaydedilir</span>
            </span>
          </div>
        </div>

        {/* Scheduled Matches Cards */}
        {scheduledMatches.length === 0 ? (
          <div className={`p-8 text-center text-xs rounded-2xl mt-4 border ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            Şu an için takvimde planlanmış yeni bir maç bulunmamaktadır.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {scheduledMatches.map((m) => {
              const p1 = players.find((p) => p.id === m.challengerId);
              const p2 = players.find((p) => p.id === m.defenderId);
              const p1Name = p1?.name || 'Oyuncu';
              const p2Name = p2?.name || 'Oyuncu';

              // Format date nicely in Turkish
              const matchDateFormatted = new Date(m.matchDate).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                weekday: 'short',
              });

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between gap-3 ${
                    isLight
                      ? 'bg-slate-50/80 hover:bg-white border-slate-200'
                      : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Date, Time, Court & Category */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        {matchDateFormatted} • {m.matchTime || '18:00'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.category === 'men'
                            ? isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-950 text-sky-400'
                            : isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {m.category === 'men' ? 'Erkekler' : 'Kadınlar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{m.court || 'A Kortu (Sert Kort)'}</span>
                    </div>

                    {/* Players Matchup */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{p1Name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{m.challengerRankAtMatch}
                        </span>
                      </div>
                      <div className={`text-center text-[10px] font-bold uppercase tracking-widest ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        vs
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{p2Name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{m.defenderRankAtMatch}
                        </span>
                      </div>
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                        "{m.notes}"
                      </p>
                    )}
                  </div>

                  {/* Calendar Action Button: set 1 hour before match */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCalendar(m)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      title="Google Ajanda'da 1 saat öncesine randevu oluştur"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ajandama Ekle</span>
                    </button>

                    <button
                      onClick={() => handleDownloadIcs(m)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                      title="Apple Takvim / Outlook (.ics dosyası) İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => setMatchToDelete(m)}
                        className="p-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                        title="Bu Maç Eşleştirmesini İptal Et & Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Switcher for Mobile */}
      <div className={`flex sm:hidden p-1 rounded-xl border text-xs ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <button
          onClick={() => setActiveCategoryTab('both')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            activeCategoryTab === 'both'
              ? isLight ? 'bg-slate-900 text-white' : 'bg-slate-800 text-white'
              : 'text-slate-500'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setActiveCategoryTab('women')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            activeCategoryTab === 'women' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500'
          }`}
        >
          Kadınlar ({womenPlayers.length})
        </button>
        <button
          onClick={() => setActiveCategoryTab('men')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${
            activeCategoryTab === 'men' ? 'bg-sky-600 text-white font-bold' : 'text-slate-500'
          }`}
        >
          Erkekler ({menPlayers.length})
        </button>
      </div>

      {/* DUAL RANKING TABLES: Clean, Non-Repetitive, Official */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. KADIN DEFİ SIRALAMASI */}
        {(activeCategoryTab === 'both' || activeCategoryTab === 'women') && (
          <div className={`rounded-3xl p-5 sm:p-6 space-y-4 border transition-all shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center font-bold text-white shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <span>14(+) Tek Kadınlar</span>
                    <span className="text-[11px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-full font-bold">
                      {womenPlayers.length} Sporcu
                    </span>
                  </h2>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ZTDSK Güncel Defi Sıralaması
                  </p>
                </div>
              </div>
            </div>

            {/* List with direct player entry buttons next to names */}
            <div className={`divide-y rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white divide-slate-200 border-slate-200' : 'bg-slate-950/60 divide-slate-800 border-slate-800'
            }`}>
              {womenPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => onOpenPlayerLogin(player.id)}
                  className={`px-4 py-3 flex items-center justify-between transition cursor-pointer group ${
                    player.isExcused
                      ? isLight
                        ? 'bg-amber-50/70 border-l-4 border-l-amber-500 hover:bg-amber-100/70'
                        : 'bg-amber-950/25 border-l-4 border-l-amber-500 hover:bg-amber-900/35'
                      : isLight
                      ? 'hover:bg-rose-50/60'
                      : 'hover:bg-slate-800/40'
                  }`}
                  title={`${player.name} olarak giriş yapmak için tıklayın`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs font-mono shrink-0 ${
                        player.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                          : isLight
                          ? 'bg-slate-100 border border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {player.rank}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-bold text-xs sm:text-sm truncate transition flex items-center gap-2 ${
                        isLight ? 'text-slate-950 group-hover:text-rose-700' : 'text-white group-hover:text-rose-400'
                      }`}>
                        <span>{player.name}</span>
                        {player.isExcused && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold inline-flex items-center gap-1">
                            <span>⏸️ Mazeretli</span>
                            {player.excuseReason && <span className="opacity-80 hidden sm:inline">({player.excuseReason})</span>}
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] flex items-center gap-2 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        <span>{player.matchesPlayed} Maç ({player.wins}G / {player.losses}M)</span>
                        {player.isExcused && player.excuseStartDate && (
                          <span className="text-[10px] text-amber-500/90 font-medium">
                            • {player.excuseStartDate} - {player.excuseEndDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Player entry button next to rank */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{player.rank}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPlayerLogin(player.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      title={`${player.name} olarak giriş yap`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Giriş</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ERKEK DEFİ SIRALAMASI */}
        {(activeCategoryTab === 'both' || activeCategoryTab === 'men') && (
          <div className={`rounded-3xl p-5 sm:p-6 space-y-4 border transition-all shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center font-bold text-white shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <span>14(+) Tek Erkekler</span>
                    <span className="text-[11px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-2 py-0.5 rounded-full font-bold">
                      {menPlayers.length} Sporcu
                    </span>
                  </h2>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ZTDSK Güncel Defi Sıralaması
                  </p>
                </div>
              </div>
            </div>

            {/* List with direct player entry buttons next to names */}
            <div className={`divide-y rounded-2xl border overflow-hidden max-h-[850px] overflow-y-auto ${
              isLight ? 'bg-white divide-slate-200 border-slate-200' : 'bg-slate-950/60 divide-slate-800 border-slate-800'
            }`}>
              {menPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => onOpenPlayerLogin(player.id)}
                  className={`px-4 py-3 flex items-center justify-between transition cursor-pointer group ${
                    player.isExcused
                      ? isLight
                        ? 'bg-amber-50/70 border-l-4 border-l-amber-500 hover:bg-amber-100/70'
                        : 'bg-amber-950/25 border-l-4 border-l-amber-500 hover:bg-amber-900/35'
                      : isLight
                      ? 'hover:bg-emerald-50/60'
                      : 'hover:bg-slate-800/40'
                  }`}
                  title={`${player.name} olarak giriş yapmak için tıklayın`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs font-mono shrink-0 ${
                        player.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                          : isLight
                          ? 'bg-slate-100 border border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {player.rank}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-bold text-xs sm:text-sm truncate transition flex items-center gap-2 ${
                        isLight ? 'text-slate-950 group-hover:text-emerald-700' : 'text-white group-hover:text-emerald-400'
                      }`}>
                        <span>{player.name}</span>
                        {player.isExcused && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold inline-flex items-center gap-1">
                            <span>⏸️ Mazeretli</span>
                            {player.excuseReason && <span className="opacity-80 hidden sm:inline">({player.excuseReason})</span>}
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] flex items-center gap-2 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        <span>{player.matchesPlayed} Maç ({player.wins}G / {player.losses}M)</span>
                        {player.isExcused && player.excuseStartDate && (
                          <span className="text-[10px] text-amber-500/90 font-medium">
                            • {player.excuseStartDate} - {player.excuseEndDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Player entry button next to rank */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{player.rank}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPlayerLogin(player.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      title={`${player.name} olarak giriş yap`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Giriş</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAÇ SİLME / İPTAL ONAY MODALI */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-rose-500 ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-700 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Maç Eşleştirmesini İptal Et & Sil
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Bu maç eşleştirmesi takvimden, fikstürden ve ana sayfa listesinden tamamen silinecektir.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {players.find((p) => p.id === matchToDelete.challengerId)?.name || 'Oyuncu'} (#{matchToDelete.challengerRankAtMatch}) vs {players.find((p) => p.id === matchToDelete.defenderId)?.name || 'Oyuncu'} (#{matchToDelete.defenderRankAtMatch})
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Tarih & Saat: <strong>{matchToDelete.matchDate} {matchToDelete.matchTime}</strong>
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Kort: <strong>{matchToDelete.court}</strong> • Kategori: <strong>{matchToDelete.category === 'men' ? '14(+) Erkekler' : '14(+) Kadınlar'}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMatch(matchToDelete.id);
                  setMatchToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                Evet, Eşleştirmeyi İptal Et ve Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
