import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Match, Player } from '../types/defi';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Trophy, Flame, CheckCircle2, AlertCircle, Swords, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';

interface CalendarViewProps {
  onOpenScoreModal: (match: Match) => void;
  onOpenChallengeModal?: (player: Player) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenScoreModal }) => {
  const { matches, players, currentCategory, currentUser, isAdmin, confirmScore, deleteMatch, theme } = useDefi();
  const isLight = theme === 'light';

  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  // Current simulation reference date is 2026-10-14
  const TODAY_STR = '2026-10-14';
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_STR);

  // Month navigation: October 2026 (Month 9, 0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0 = Jan, 9 = Oct

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const categoryMatches = matches.filter((m) => m.category === currentCategory);

  // Today's matches (Before or after played)
  const todaysMatches = categoryMatches.filter((m) => m.matchDate === TODAY_STR && m.status !== 'cancelled');

  // Selected date matches
  const selectedDateMatches = categoryMatches.filter(
    (m) => m.matchDate === selectedDate && m.status !== 'cancelled'
  );

  // Upcoming matches (dates after today)
  const upcomingMatches = categoryMatches
    .filter((m) => m.matchDate > TODAY_STR && m.status !== 'cancelled')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate));

  // Generate calendar days for current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);

  const getMatchDayInfo = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayMatches = categoryMatches.filter((m) => m.matchDate === dateStr && m.status !== 'cancelled');
    return {
      dateStr,
      hasMatches: dayMatches.length > 0,
      count: dayMatches.length,
      hasCompleted: dayMatches.some((m) => m.status === 'confirmed'),
      hasPendingScore: dayMatches.some((m) => m.status === 'score_submitted'),
      hasScheduled: dayMatches.some((m) => m.status === 'scheduled'),
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. GÜNÜN MAÇLARI SECTION (Showcase) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Günün Maçları</h2>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  14 Ekim 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Günün maçları oynanmadan önce programıyla, oynandıktan sonra skorlarıyla gün sonuna kadar burada sergilenir.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDate(TODAY_STR)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition self-start sm:self-auto"
          >
            Takvimde Bugüne Git
          </button>
        </div>

        {todaysMatches.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800">
            Bugün için planlanmış maç bulunmuyor. Defi tablosundan oyunculara meydan okuyabilirsiniz!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaysMatches.map((m) => {
              const challenger = getPlayer(m.challengerId);
              const defender = getPlayer(m.defenderId);
              if (!challenger || !defender) return null;

              const canScore =
                isAdmin ||
                (currentUser && (currentUser.id === challenger.id || currentUser.id === defender.id));

              const isLoserAwaitingMyConfirmation =
                currentUser &&
                m.status === 'score_submitted' &&
                m.score?.loserId === currentUser.id;

              return (
                <div
                  key={m.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden"
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{m.matchTime || '18:00'}</span>
                      <span className="text-slate-600">•</span>
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{m.court || 'A Kortu (Sert Kort)'}</span>
                    </span>

                    {m.status === 'confirmed' ? (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Tamamlandı (Onaylı)
                      </span>
                    ) : m.status === 'score_submitted' ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 animate-spin" />
                        Rakip Onayı Bekleniyor
                      </span>
                    ) : (
                      <span className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Bugün Oynanacak
                      </span>
                    )}
                  </div>

                  {/* Players Display */}
                  <div className="grid grid-cols-2 gap-3 items-center py-1">
                    {/* Challenger */}
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="w-7 h-7 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        #{challenger.rank}
                      </div>
                      <div className="truncate text-xs">
                        <div className={`font-bold truncate ${isLight ? 'text-slate-950' : 'text-white'}`}>{challenger.name}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Meydan Okuyan</div>
                      </div>
                    </div>

                    {/* Defender */}
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="w-7 h-7 rounded-md bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        #{defender.rank}
                      </div>
                      <div className="truncate text-xs">
                        <div className={`font-bold truncate ${isLight ? 'text-slate-950' : 'text-white'}`}>{defender.name}</div>
                        <div className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Üst Sıradaki</div>
                      </div>
                    </div>
                  </div>

                  {/* Score or Actions */}
                  {m.score ? (
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                    }`}>
                      <div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Maç Skoru:</div>
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-wide">
                          {m.score.scoreText}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Kazanan:</span>
                        <div className={`font-bold flex items-center gap-1 justify-end ${isLight ? 'text-slate-950' : 'text-white'}`}>
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>{getPlayer(m.score.winnerId)?.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      {m.notes || 'Maç 3 set üzerinden karar puanlı oynanacaktır.'}
                    </div>
                  )}

                  {/* Score Submission or Confirmation Button */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {m.status === 'scheduled' && canScore && (
                      <button
                        onClick={() => onOpenScoreModal(m)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Skor Gir (Kazanan Bildirimi)</span>
                      </button>
                    )}

                    {m.status === 'score_submitted' && isLoserAwaitingMyConfirmation && (
                      <button
                        onClick={() => confirmScore(m.id)}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow animate-bounce"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Skoru Onayla & Sıralamayı Güncelle</span>
                      </button>
                    )}

                    {m.status === 'score_submitted' && isAdmin && (
                      <button
                        onClick={() => confirmScore(m.id)}
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        Yönetici Olarak Onayla
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => setMatchToDelete(m)}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center gap-1 transition cursor-pointer"
                        title="Bu Maç Eşleştirmesini İptal Et & Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>İptal Et / Sil</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE CALENDAR & SELECTED DAY MATCHES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">
                {monthNames[currentMonth]} {currentYear}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(9); // Oct 2026
                  setSelectedDate(TODAY_STR);
                }}
                className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Bugün
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday names */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 uppercase">
            <div>Pzt</div>
            <div>Sal</div>
            <div>Çar</div>
            <div>Per</div>
            <div>Cum</div>
            <div>Cmt</div>
            <div>Paz</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset days */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/20" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const info = getMatchDayInfo(day);
              const isSelected = selectedDate === info.dateStr;
              const isToday = info.dateStr === TODAY_STR;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(info.dateStr)}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between items-start transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950/80 ring-1 ring-emerald-500'
                      : isToday
                      ? 'border-amber-500/60 bg-amber-950/20'
                      : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-emerald-300'
                          : isToday
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>

                  {/* Badges for matches */}
                  {info.hasMatches && (
                    <div className="w-full flex flex-col gap-0.5">
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded truncate text-left ${
                          info.hasCompleted
                            ? 'bg-emerald-900/80 text-emerald-300'
                            : info.hasPendingScore
                            ? 'bg-amber-900/80 text-amber-300'
                            : 'bg-sky-900/80 text-sky-300'
                        }`}
                      >
                        {info.count} Maç
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Oynanmış / Onaylı Maç
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Onay Bekleyen Skor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Planlanmış Gelecek Maç
            </span>
          </div>
        </div>

        {/* Selected Day Match Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Seçilen Günün Maçları
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {selectedDate === TODAY_STR ? 'Bugün, ' : ''}{selectedDate}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                {selectedDateMatches.length} Maç
              </span>
            </div>

            {selectedDateMatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Bu tarihte kayıtlı bir maç bulunmamaktadır.</p>
                <p className="text-[11px] text-slate-500">
                  Takvimdeki işaretli günlere tıklayarak maçları görebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {selectedDateMatches.map((m) => {
                  const challenger = getPlayer(m.challengerId);
                  const defender = getPlayer(m.defenderId);
                  if (!challenger || !defender) return null;

                  const canScore =
                    isAdmin ||
                    (currentUser && (currentUser.id === challenger.id || currentUser.id === defender.id));

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-sky-400" />
                          {m.matchTime || '18:00'} • {m.court || 'A Kortu (Sert Kort)'}
                        </span>
                        {m.status === 'confirmed' ? (
                          <span className="text-emerald-400 font-bold">Tamamlandı</span>
                        ) : m.status === 'score_submitted' ? (
                          <span className="text-amber-400 font-bold">Onay Bekliyor</span>
                        ) : (
                          <span className="text-sky-400 font-bold">Planlandı</span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-white flex items-center justify-between">
                        <span>#{challenger.rank} {challenger.name}</span>
                        <span className="text-slate-500 text-[10px]">vs</span>
                        <span>#{defender.rank} {defender.name}</span>
                      </div>

                      {m.score && (
                        <div className="p-2 bg-slate-900 rounded-lg text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                          <span>Skor: {m.score.scoreText}</span>
                          <span className="text-[10px] text-slate-300">
                            Kazanan: {getPlayer(m.score.winnerId)?.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {m.status === 'scheduled' && canScore && (
                          <button
                            onClick={() => onOpenScoreModal(m)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Skor Gir</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setMatchToDelete(m)}
                            className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Bu Maç Eşleştirmesini İptal Et & Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>İptal Et / Sil</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats in Date Box */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
            <span>Lig Takvimi: 5 Ekim 2026 - 21 Şubat 2027</span>
            <span className="text-emerald-400 font-semibold">17 Hafta Süreç</span>
          </div>
        </div>
      </div>

      {/* 3. UPCOMING MATCHES STRIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-sky-400" />
            Gelecek Maçlar Takvimi
          </h3>
          <span className="text-xs text-slate-400">
            Toplam {upcomingMatches.length} maç planlandı
          </span>
        </div>

        {upcomingMatches.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-xl">
            İlerleyen tarihler için planlanmış maç kaydı bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingMatches.map((m) => {
              const challenger = getPlayer(m.challengerId);
              const defender = getPlayer(m.defenderId);
              if (!challenger || !defender) return null;

              return (
                <div
                  key={m.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-sky-500/50 transition cursor-pointer"
                  onClick={() => setSelectedDate(m.matchDate)}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">{m.matchDate}</span>
                    <span className="text-slate-400">{m.matchTime || '18:00'} • {m.court}</span>
                  </div>
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span className="truncate">#{challenger.rank} {challenger.name}</span>
                    <span className="text-slate-500 text-[10px] px-1">vs</span>
                    <span className="truncate">#{defender.rank} {defender.name}</span>
                  </div>
                </div>
              );
            })}
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
                  Bu maç eşleştirmesi fikstürden, takvimden ve ana sayfa listesinden tamamen silinecektir.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {getPlayer(matchToDelete.challengerId)?.name || 'Oyuncu'} (#{matchToDelete.challengerRankAtMatch}) vs {getPlayer(matchToDelete.defenderId)?.name || 'Oyuncu'} (#{matchToDelete.defenderRankAtMatch})
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
