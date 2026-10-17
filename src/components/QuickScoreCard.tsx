import React, { useState, useMemo } from 'react';
import { useDefi } from '../context/DefiContext';
import { MatchScore, SetScore, Match, MatchFinishType } from '../types/defi';
import {
  Zap,
  Trophy,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Activity,
  UserX,
} from 'lucide-react';

interface QuickScoreCardProps {
  onScoreSaved?: () => void;
}

export const QuickScoreCard: React.FC<QuickScoreCardProps> = ({ onScoreSaved }) => {
  const {
    players,
    matches,
    currentCategory,
    scheduleMatch,
    adminDirectApproveScore,
    showToast,
    theme,
  } = useDefi();

  const isLight = theme === 'light';

  // Category players sorted by rank
  const categoryPlayers = useMemo(
    () =>
      players
        .filter((p) => p.category === currentCategory)
        .sort((a, b) => a.rank - b.rank),
    [players, currentCategory]
  );

  // Scheduled / pending matches in this category
  const scheduledMatches = useMemo(
    () =>
      matches.filter(
        (m) =>
          m.category === currentCategory &&
          (m.status === 'scheduled' || m.status === 'score_submitted')
      ),
    [matches, currentCategory]
  );

  // Selection mode: 'from_scheduled' or 'custom_players'
  const [sourceMode, setSourceMode] = useState<'from_scheduled' | 'custom_players'>(
    scheduledMatches.length > 0 ? 'from_scheduled' : 'custom_players'
  );

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    scheduledMatches[0]?.id || ''
  );
  const [p1Id, setP1Id] = useState<string>(categoryPlayers[1]?.id || '');
  const [p2Id, setP2Id] = useState<string>(categoryPlayers[0]?.id || '');
  const [matchDate, setMatchDate] = useState<string>('2026-10-14');
  const [court, setCourt] = useState<string>('Merkez Kort');

  // Match Finish Type: normal, retired, walkover
  const [finishType, setFinishType] = useState<MatchFinishType>('completed');
  const [manualWinnerId, setManualWinnerId] = useState<string>('');

  // Interactive Click Scores:
  const [set1P1, setSet1P1] = useState<number>(6);
  const [set1P2, setSet1P2] = useState<number>(3);
  const [set2P1, setSet2P1] = useState<number>(6);
  const [set2P2, setSet2P2] = useState<number>(4);
  const [set3P1, setSet3P1] = useState<number>(10);
  const [set3P2, setSet3P2] = useState<number>(8);
  const [hasThirdSetManual, setHasThirdSetManual] = useState<boolean>(false);

  // Active target match if from_scheduled
  const activeScheduledMatch = scheduledMatches.find((m) => m.id === selectedMatchId);

  // Determine active Challenger & Defender
  const challenger = useMemo(() => {
    if (sourceMode === 'from_scheduled' && activeScheduledMatch) {
      return players.find((p) => p.id === activeScheduledMatch.challengerId);
    }
    return players.find((p) => p.id === p1Id);
  }, [sourceMode, activeScheduledMatch, players, p1Id]);

  const defender = useMemo(() => {
    if (sourceMode === 'from_scheduled' && activeScheduledMatch) {
      return players.find((p) => p.id === activeScheduledMatch.defenderId);
    }
    return players.find((p) => p.id === p2Id);
  }, [sourceMode, activeScheduledMatch, players, p2Id]);

  // Determine sets won
  let p1Sets = 0;
  let p2Sets = 0;

  if (set1P1 > set1P2) p1Sets++;
  else if (set1P2 > set1P1) p2Sets++;

  if (set2P1 > set2P2) p1Sets++;
  else if (set2P2 > set2P1) p2Sets++;

  const isTied = p1Sets === 1 && p2Sets === 1;

  if (isTied || hasThirdSetManual) {
    if (set3P1 > set3P2) p1Sets++;
    else if (set3P2 > set3P1) p2Sets++;
  }

  const activeWinnerId = manualWinnerId || (defender ? defender.id : '');

  const winner = useMemo(() => {
    if (!challenger || !defender) return null;
    if (finishType === 'walkover' || finishType === 'retired') {
      return activeWinnerId === challenger.id ? challenger : defender;
    }
    return p1Sets > p2Sets ? challenger : defender;
  }, [challenger, defender, finishType, activeWinnerId, p1Sets, p2Sets]);

  const loser = useMemo(() => {
    if (!challenger || !defender || !winner) return null;
    return winner.id === challenger.id ? defender : challenger;
  }, [challenger, defender, winner]);

  // Preset tennis score buttons
  const standardSetsP1Win = [
    [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 5], [7, 6]
  ];
  const standardSetsP2Win = [
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 7], [6, 7]
  ];

  const tieBreakP1Win = [
    [10, 4], [10, 6], [10, 7], [10, 8], [11, 9], [12, 10]
  ];
  const tieBreakP2Win = [
    [4, 10], [6, 10], [7, 10], [8, 10], [9, 11], [10, 12]
  ];

  const handleSaveScore = () => {
    if (!challenger || !defender) {
      showToast('Lütfen geçerli iki oyuncu seçiniz.', 'error');
      return;
    }

    if (challenger.id === defender.id) {
      showToast('Bir oyuncu kendisiyle maç yapamaz.', 'error');
      return;
    }

    if (finishType === 'completed' && p1Sets === p2Sets) {
      showToast('Maç skoru berabere kalamaz! Lütfen set skorlarını kontrol ediniz.', 'error');
      return;
    }

    let sets: SetScore[];
    let scoreText = '';

    if (finishType === 'walkover') {
      sets = [{ player1Games: 0, player2Games: 0 }];
      scoreText = `W.O. (${winner!.name} Hükmen Galip)`;
    } else if (finishType === 'retired') {
      sets = [{ player1Games: set1P1, player2Games: set1P2 }];
      if (set2P1 > 0 || set2P2 > 0) {
        sets.push({ player1Games: set2P1, player2Games: set2P2 });
      }
      scoreText = `${set1P1}-${set1P2}${set2P1 > 0 || set2P2 > 0 ? `, ${set2P1}-${set2P2}` : ''} (Ret. - ${loser!.name} Çekildi)`;
    } else {
      sets = [
        { player1Games: set1P1, player2Games: set1P2 },
        { player1Games: set2P1, player2Games: set2P2 },
      ];

      scoreText = `${set1P1}-${set1P2}, ${set2P1}-${set2P2}`;

      if (isTied || hasThirdSetManual) {
        sets.push({ player1Games: set3P1, player2Games: set3P2 });
        scoreText += `, [${set3P1}-${set3P2}]`;
      }
    }

    const matchScore: MatchScore = {
      sets,
      winnerId: winner!.id,
      loserId: loser!.id,
      scoreText,
      finishType,
    };

    if (sourceMode === 'from_scheduled' && activeScheduledMatch) {
      adminDirectApproveScore(activeScheduledMatch.id, matchScore);
    } else {
      // Create new match directly and approve it immediately
      const newMatch = scheduleMatch({
        challengerId: challenger.id,
        defenderId: defender.id,
        challengerRankAtMatch: challenger.rank,
        defenderRankAtMatch: defender.rank,
        category: challenger.category,
        matchDate,
        court,
        notes: finishType === 'walkover'
          ? 'Hükmen galibiyet (Walkover) olarak kaydedildi.'
          : finishType === 'retired'
          ? 'Çekilme / Sakatlık (Retired) olarak kaydedildi.'
          : 'Yönetici Hızlı Skor Girişi ile kesinleştirildi.',
      });

      adminDirectApproveScore(newMatch.id, matchScore);
    }

    showToast(`⚡ ${winner!.name} galibiyeti sisteme kaydedildi! Sıralama güncellendi.`, 'success');
    if (onScoreSaved) onScoreSaved();
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 space-y-5 border shadow-xl transition-all ${
        isLight
          ? 'bg-gradient-to-br from-white via-amber-50/40 to-emerald-50/40 border-amber-200 text-slate-900'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-amber-600/30 text-white'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <Zap className="w-5 h-5 fill-amber-500" />
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>Hızlı Skor Arayüzü</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Tek Tıkla
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klavyeden sayı yazmadan, sadece butonlara tıklayarak maç skorunu ve sıralama değişimini kesinleştirin.
            </p>
          </div>
        </div>

        {/* Source Toggle */}
        <div className="flex items-center bg-black/20 p-1 rounded-xl border border-slate-700/60 text-xs self-start sm:self-auto">
          {scheduledMatches.length > 0 && (
            <button
              type="button"
              onClick={() => setSourceMode('from_scheduled')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                sourceMode === 'from_scheduled'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Planlanmış Maçtan ({scheduledMatches.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setSourceMode('custom_players')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              sourceMode === 'custom_players'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            İki Oyuncu Seç
          </button>
        </div>
      </div>

      {/* Step 1: Match & Player Selection */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
          1. Adım: Oyuncuları Belirleyin
        </span>

        {sourceMode === 'from_scheduled' && scheduledMatches.length > 0 ? (
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">
              Kayıtlı ve Oynanmayı Bekleyen Maç:
            </label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full bg-slate-950 border border-amber-600/40 rounded-xl p-2.5 text-xs font-bold text-white focus:border-amber-500"
            >
              {scheduledMatches.map((m) => {
                const p1 = players.find((p) => p.id === m.challengerId);
                const p2 = players.find((p) => p.id === m.defenderId);
                return (
                  <option key={m.id} value={m.id}>
                    {m.matchDate} — #{p1?.rank} {p1?.name} vs #{p2?.rank} {p2?.name} ({m.court})
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-emerald-400">
                1. Oyuncu (Meydan Okuyan):
              </label>
              <select
                value={p1Id}
                onChange={(e) => setP1Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white focus:border-emerald-500"
              >
                <option value="">Oyuncu Seçin</option>
                {categoryPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.rank} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sky-400">
                2. Oyuncu (Savunan):
              </label>
              <select
                value={p2Id}
                onChange={(e) => setP2Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white focus:border-sky-500"
              >
                <option value="">Oyuncu Seçin</option>
                {categoryPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.rank} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300">Maç Tarihi:</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-bold text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300">Kort:</label>
              <select
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white focus:border-blue-500"
              >
                <option value="Merkez Kort (Toprak)">Merkez Kort (Toprak)</option>
                <option value="A Kortu (Sert Kort)">A Kortu (Sert Kort)</option>
                <option value="B Kortu (Toprak)">B Kortu (Toprak)</option>
                <option value="Kapalı Kort">Kapalı Kort</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Players Header Banner */}
      {challenger && defender && (
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">
              #{challenger.rank}
            </span>
            <span className="font-bold text-sm text-white">{challenger.name}</span>
            <span className="text-[10px] text-emerald-400">(Meydan Okuyan)</span>
          </div>

          <span className="text-xs font-bold text-slate-500 px-2">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sky-400">(Savunan)</span>
            <span className="font-bold text-sm text-white">{defender.name}</span>
            <span className="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-xs">
              #{defender.rank}
            </span>
          </div>
        </div>
      )}

      {/* Finish Type Tabs */}
      {challenger && defender && (
        <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setFinishType('completed')}
            className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              finishType === 'completed'
                ? 'bg-emerald-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎾 Normal Maç</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFinishType('retired');
              if (!manualWinnerId && defender) setManualWinnerId(defender.id);
            }}
            className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              finishType === 'retired'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Çekilme (Ret.)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFinishType('walkover');
              if (!manualWinnerId && defender) setManualWinnerId(defender.id);
            }}
            className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              finishType === 'walkover'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Hükmen (W.O.)</span>
          </button>
        </div>
      )}

      {/* Walkover (W.O.) Card */}
      {challenger && defender && finishType === 'walkover' && (
        <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <UserX className="w-4 h-4" />
            <span>Hükmen Galibiyet (Walkover / W.O.) Seçimi:</span>
          </div>
          <p className="text-xs text-slate-300">
            Sporculardan biri maça çıkmadığında veya gelemediğinde maçı hükmen kazanan oyuncuyu belirleyiniz:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setManualWinnerId(defender.id)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                activeWinnerId === defender.id
                  ? 'bg-purple-900/80 border-purple-400 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs text-purple-300 flex items-center justify-between">
                <span>{defender.name}</span>
                <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-200">Hükmen Galip</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{challenger.name} maça çıkamadı</div>
            </button>
            <button
              type="button"
              onClick={() => setManualWinnerId(challenger.id)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                activeWinnerId === challenger.id
                  ? 'bg-purple-900/80 border-purple-400 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs text-purple-300 flex items-center justify-between">
                <span>{challenger.name}</span>
                <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-200">Hükmen Galip</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{defender.name} maça çıkamadı</div>
            </button>
          </div>
        </div>
      )}

      {/* Retired (Çekilme) Card */}
      {challenger && defender && finishType === 'retired' && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Activity className="w-4 h-4" />
            <span>Çekilme / Sakatlık (Retired) Seçimi:</span>
          </div>
          <p className="text-xs text-slate-300">
            Maç esnasında sakatlanan/maçı bırakan sporcuyu ve galip ilan edilen sporcuyu seçiniz. Ardından aşağıdaki tablodan maçın yarım kaldığı andaki set skorlarını kaydediniz:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setManualWinnerId(defender.id)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                activeWinnerId === defender.id
                  ? 'bg-amber-900/80 border-amber-400 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs text-amber-300 flex items-center justify-between">
                <span>{defender.name}</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">Galip (Ret.)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{challenger.name} oyunu bıraktı</div>
            </button>
            <button
              type="button"
              onClick={() => setManualWinnerId(challenger.id)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                activeWinnerId === challenger.id
                  ? 'bg-amber-900/80 border-amber-400 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs text-amber-300 flex items-center justify-between">
                <span>{challenger.name}</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">Galip (Ret.)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{defender.name} oyunu bıraktı</div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Set Result Selection via Single Click */}
      {challenger && defender && finishType !== 'walkover' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              2. Adım: Set Sonuçlarını Tıklayarak Seçin
            </span>
            <div className="font-mono font-bold text-sm px-3 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-600/50 flex items-center gap-1.5 shadow-sm">
              <span>Seçilen Skor:</span>
              <span className="text-white">
                {set1P1}-{set1P2}, {set2P1}-{set2P2}
                {(isTied || hasThirdSetManual) ? ` [${set3P1}-${set3P2}]` : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. SET */}
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                  1. Set Sonucu
                </span>
                <span className="font-mono font-bold text-xs text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {set1P1} - {set1P2}
                </span>
              </div>

              {/* Challenger Wins Set 1 */}
              <div>
                <div className="text-[10px] text-emerald-400 font-semibold mb-1">
                  {challenger.name.split(' ')[0]} Kazandı:
                </div>
                <div className="flex flex-wrap gap-1">
                  {standardSetsP1Win.map(([p1g, p2g]) => (
                    <button
                      key={`s1-p1-${p1g}-${p2g}`}
                      type="button"
                      onClick={() => { setSet1P1(p1g); setSet1P2(p2g); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                        set1P1 === p1g && set1P2 === p2g
                          ? 'bg-emerald-600 text-slate-950 ring-2 ring-emerald-400 font-black scale-105 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                      }`}
                    >
                      {p1g}-{p2g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Defender Wins Set 1 */}
              <div>
                <div className="text-[10px] text-sky-400 font-semibold mb-1">
                  {defender.name.split(' ')[0]} Kazandı:
                </div>
                <div className="flex flex-wrap gap-1">
                  {standardSetsP2Win.map(([p1g, p2g]) => (
                    <button
                      key={`s1-p2-${p1g}-${p2g}`}
                      type="button"
                      onClick={() => { setSet1P1(p1g); setSet1P2(p2g); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                        set1P1 === p1g && set1P2 === p2g
                          ? 'bg-sky-600 text-slate-950 ring-2 ring-sky-400 font-black scale-105 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                      }`}
                    >
                      {p1g}-{p2g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. SET */}
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                  2. Set Sonucu
                </span>
                <span className="font-mono font-bold text-xs text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {set2P1} - {set2P2}
                </span>
              </div>

              {/* Challenger Wins Set 2 */}
              <div>
                <div className="text-[10px] text-emerald-400 font-semibold mb-1">
                  {challenger.name.split(' ')[0]} Kazandı:
                </div>
                <div className="flex flex-wrap gap-1">
                  {standardSetsP1Win.map(([p1g, p2g]) => (
                    <button
                      key={`s2-p1-${p1g}-${p2g}`}
                      type="button"
                      onClick={() => { setSet2P1(p1g); setSet2P2(p2g); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                        set2P1 === p1g && set2P2 === p2g
                          ? 'bg-emerald-600 text-slate-950 ring-2 ring-emerald-400 font-black scale-105 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                      }`}
                    >
                      {p1g}-{p2g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Defender Wins Set 2 */}
              <div>
                <div className="text-[10px] text-sky-400 font-semibold mb-1">
                  {defender.name.split(' ')[0]} Kazandı:
                </div>
                <div className="flex flex-wrap gap-1">
                  {standardSetsP2Win.map(([p1g, p2g]) => (
                    <button
                      key={`s2-p2-${p1g}-${p2g}`}
                      type="button"
                      onClick={() => { setSet2P1(p1g); setSet2P2(p2g); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                        set2P1 === p1g && set2P2 === p2g
                          ? 'bg-sky-600 text-slate-950 ring-2 ring-sky-400 font-black scale-105 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                      }`}
                    >
                      {p1g}-{p2g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. SET (10'LU SÜPER TIE-BREAK) */}
          {(isTied || hasThirdSetManual) && (
            <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-600/50 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                <span className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">3</span>
                  3. Set Karar Tie-Break (Madde 15: 10 Puanlık)
                </span>
                <span className="font-mono font-bold text-xs text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-700">
                  [{set3P1} - {set3P2}]
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-emerald-400 font-semibold mb-1">
                    {challenger.name.split(' ')[0]} Tie-Break Galibiyeti:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tieBreakP1Win.map(([p1g, p2g]) => (
                      <button
                        key={`s3-p1-${p1g}-${p2g}`}
                        type="button"
                        onClick={() => { setSet3P1(p1g); setSet3P2(p2g); }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                          set3P1 === p1g && set3P2 === p2g
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-black shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 text-amber-200 border border-slate-800'
                        }`}
                      >
                        {p1g}-{p2g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-sky-400 font-semibold mb-1">
                    {defender.name.split(' ')[0]} Tie-Break Galibiyeti:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tieBreakP2Win.map(([p1g, p2g]) => (
                      <button
                        key={`s3-p2-${p1g}-${p2g}`}
                        type="button"
                        onClick={() => { setSet3P1(p1g); setSet3P2(p2g); }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                          set3P1 === p1g && set3P2 === p2g
                            ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 font-black shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 text-sky-200 border border-slate-800'
                        }`}
                      >
                        {p1g}-{p2g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle manual 3rd set */}
          {!isTied && (
            <div className="flex justify-end">
              <label className="text-xs text-slate-400 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasThirdSetManual}
                  onChange={(e) => setHasThirdSetManual(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500"
                />
                <span>3. Set (10'lu Karar Tie-Break) manuel olarak ekle</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Winner & Rank Impact Preview */}
      {challenger && defender && winner && loser && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {finishType === 'walkover'
                  ? 'Hükmen Kazanan: '
                  : finishType === 'retired'
                  ? 'Galip İlan Edilen: '
                  : 'Kazanan: '}
                <span className="text-emerald-400 underline font-black">{winner.name}</span>
              </span>
              <span className="text-xs text-slate-400">
                {finishType === 'walkover'
                  ? '(Hükmen - W.O.)'
                  : finishType === 'retired'
                  ? '(Çekilme - Ret.)'
                  : `(${p1Sets} - ${p2Sets})`}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {winner.id === challenger.id ? (
                <span>
                  Meydan okuyan <strong className="text-white">{challenger.name}</strong> kazandığı için{' '}
                  <strong className="text-amber-400">#{defender.rank}</strong>. sıraya yükselecek.
                </span>
              ) : (
                <span>
                  Savunan <strong className="text-white">{defender.name}</strong> kazandığı için mevcut sıralama korunacak.
                </span>
              )}
            </p>
          </div>

          {/* Big Action Button */}
          <button
            type="button"
            onClick={handleSaveScore}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 cursor-pointer self-stretch sm:self-auto shrink-0"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Skoru Kaydet & Sıralamayı Kesinleştir</span>
          </button>
        </div>
      )}
    </div>
  );
};
